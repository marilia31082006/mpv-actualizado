<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Ride.php';

header('Content-Type: application/json');

// Autenticar usuário
$authUser = AuthMiddleware::checkUserType(['passageiro']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar entrada
$rules = [
    'origem_endereco' => 'required',
    'destino_endereco' => 'required',
    'origem_latitude' => 'required',
    'origem_longitude' => 'required',
    'destino_latitude' => 'required',
    'destino_longitude' => 'required'
];

validateInput($data, $rules);

$ride = new Ride();
$ride->passageiro_id = $authUser['user_id'];
$ride->origem_endereco = $data['origem_endereco'];
$ride->destino_endereco = $data['destino_endereco'];
$ride->origem_latitude = $data['origem_latitude'];
$ride->origem_longitude = $data['origem_longitude'];
$ride->destino_latitude = $data['destino_latitude'];
$ride->destino_longitude = $data['destino_longitude'];
$ride->passageiros = $data['passageiros'] ?? 1;
$ride->bagagem = $data['bagagem'] ?? 'nenhuma';
$ride->forma_pagamento = $data['forma_pagamento'] ?? 'dinheiro';

// Calcular distância e preço
$distance = $ride->calculateDistance(
    $data['origem_latitude'], 
    $data['origem_longitude'],
    $data['destino_latitude'], 
    $data['destino_longitude']
);

$ride->distancia_estimada_km = $distance;
$ride->duracao_estimada_min = round($distance * 3); // Estimativa: 3 min/km
$ride->valor_estimado = $ride->calculatePrice($distance);

if ($ride->create()) {
    // Procurar motoristas disponíveis próximos
    $availableDrivers = $ride->findNearbyDrivers(
        $data['origem_latitude'], 
        $data['origem_longitude']
    );
    
    $response = [
        'ride_id' => $ride->id,
        'codigo' => $ride->codigo,
        'valor_estimado' => $ride->valor_estimado,
        'distancia_estimada' => $ride->distancia_estimada_km,
        'duracao_estimada' => $ride->duracao_estimada_min,
        'motoristas_disponiveis' => count($availableDrivers),
        'status' => 'solicitada'
    ];
    
    jsonResponse(true, 'Corrida solicitada com sucesso', $response, 201);
} else {
    jsonResponse(false, 'Erro ao solicitar corrida', null, 500);
}
?>