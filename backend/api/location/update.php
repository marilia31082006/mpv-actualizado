<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Location.php';

header('Content-Type: application/json');

// Autenticar usuário (motorista ou passageiro)
$authUser = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar entrada
$rules = [
    'latitude' => 'required|numeric',
    'longitude' => 'required|numeric'
];

validateInput($data, $rules);

$location = new Location();
$location->usuario_id = $authUser['user_id'];
$location->latitude = $data['latitude'];
$location->longitude = $data['longitude'];
$location->velocidade = $data['velocidade'] ?? null;
$location->direcao = $data['direcao'] ?? null;
$location->bateria_nivel = $data['bateria_nivel'] ?? null;

if ($location->create()) {
    // Se for motorista, atualizar localização do veículo
    if ($authUser['user_type'] === 'motorista') {
        $location->updateVehicleLocation($authUser['user_id']);
    }
    
    $response = [
        'timestamp' => date('Y-m-d H:i:s'),
        'coordinates' => [
            'lat' => $location->latitude,
            'lng' => $location->longitude
        ]
    ];
    
    jsonResponse(true, 'Localização atualizada', $response, 200);
} else {
    jsonResponse(false, 'Erro ao atualizar localização', null, 500);
}
?>