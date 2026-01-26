<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Payment.php';

header('Content-Type: application/json');

// Verificar assinatura do webhook
$signature = $_SERVER['HTTP_X_MULTICAIXA_SIGNATURE'] ?? '';
$payload = file_get_contents('php://input');

if (!$this->verifyWebhookSignature($signature, $payload)) {
    jsonResponse(false, 'Assinatura inválida', null, 401);
}

$data = json_decode($payload, true);

// Processar notificação de pagamento
$payment = new Payment();
$result = $payment->processMulticaixaWebhook($data);

if ($result['success']) {
    // Atualizar status da corrida
    $payment->updateRideStatus($result['payment_id']);
    
    http_response_code(200);
    echo json_encode(['status' => 'success']);
} else {
    error_log('Erro no webhook Multicaixa: ' . $result['message']);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $result['message']]);
}

function verifyWebhookSignature($signature, $payload) {
    $expectedSignature = hash_hmac('sha256', $payload, MULTICAIXA_API_KEY);
    return hash_equals($expectedSignature, $signature);
}
?>