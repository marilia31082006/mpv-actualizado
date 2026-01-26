<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Payment.php';

header('Content-Type: application/json');

// Autenticar usuário
$authUser = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar entrada
$rules = [
    'ride_id' => 'required|numeric',
    'metodo' => 'required|in:dinheiro,cartao,carteira,multicaixa'
];

validateInput($data, $rules);

$payment = new Payment();
$payment->corrida_id = $data['ride_id'];
$payment->usuario_id = $authUser['user_id'];
$payment->metodo = $data['metodo'];

// Obter valor da corrida
$rideValue = $payment->getRideValue($data['ride_id']);
$payment->valor = $rideValue;
$payment->taxa = $rideValue * (TAXA_SERVICO_PERCENT / 100);
$payment->total = $rideValue + $payment->taxa;

// Processar pagamento baseado no método
switch ($data['metodo']) {
    case 'dinheiro':
        $result = $payment->processCashPayment();
        break;
        
    case 'cartao':
        $result = $payment->processCardPayment($data['card_data'] ?? []);
        break;
        
    case 'carteira':
        $result = $payment->processWalletPayment();
        break;
        
    case 'multicaixa':
        $result = $payment->processMulticaixaPayment($data['reference'] ?? '');
        break;
        
    default:
        jsonResponse(false, 'Método de pagamento não suportado', null, 400);
}

if ($result['success']) {
    $response = [
        'payment_id' => $payment->id,
        'reference' => $payment->referencia,
        'valor' => $payment->valor,
        'taxa' => $payment->taxa,
        'total' => $payment->total,
        'status' => $payment->status,
        'data_pagamento' => date('Y-m-d H:i:s')
    ];
    
    jsonResponse(true, 'Pagamento processado com sucesso', $response, 200);
} else {
    jsonResponse(false, $result['message'], $result['data'], 400);
}
?>