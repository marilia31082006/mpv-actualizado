<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Ride.php';

header('Content-Type: application/json');

// Autenticar motorista
$authUser = AuthMiddleware::checkUserType(['motorista']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar entrada
$rules = [
    'ride_id' => 'required|numeric'
];

validateInput($data, $rules);

$ride = new Ride();
$ride->id = $data['ride_id'];

if ($ride->accept($authUser['user_id'])) {
    // Atualizar status do motorista e veículo
    $ride->updateDriverStatus($authUser['user_id'], 'em_rota');
    
    $response = [
        'ride_id' => $ride->id,
        'status' => 'aceita',
        'motorista_id' => $authUser['user_id'],
        'estimated_pickup_time' => date('Y-m-d H:i:s', strtotime('+10 minutes'))
    ];
    
    // Enviar notificação ao passageiro (em produção usar WebSocket)
    
    jsonResponse(true, 'Corrida aceita com sucesso', $response, 200);
} else {
    jsonResponse(false, 'Erro ao aceitar corrida', null, 500);
}
?>