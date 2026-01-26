<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar entrada
$rules = [
    'email' => 'required|email',
    'senha' => 'required'
];

validateInput($data, $rules);

$user = new User();
$result = $user->login($data['email'], $data['senha']);

if ($result) {
    jsonResponse(true, 'Login realizado com sucesso', $result, 200);
} else {
    jsonResponse(false, 'Email ou senha incorretos', null, 401);
}
?>