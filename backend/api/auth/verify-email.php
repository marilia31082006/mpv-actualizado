<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$token = $_GET['token'] ?? '';

if (empty($token)) {
    jsonResponse(false, 'Token não fornecido', null, 400);
}

$user = new User();
if ($user->verifyEmail($token)) {
    jsonResponse(true, 'Email verificado com sucesso', null, 200);
} else {
    jsonResponse(false, 'Token inválido ou expirado', null, 400);
}
?>