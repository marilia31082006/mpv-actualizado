<?php
require "..config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data['nome']);
$email = trim($data['email']);
$pass = $data['password'];
$role = $data['role'];

if($name|| $email|| strlen($pass)<6){
    http_response_code(400);
    echo json_encode(["error" => "Dados inválidos"]);
    exit;
}

$hash = password_hash($pass, PASSWORD_BCRYPT);
$token = bin2hex(random_bytes(32));

$stmt = $pdo->prepare("INSERT INTO users(nome, email,password,role,verification_token) VALUES (?,?,?,?,?)");
$stmt -> execute([$name,$email$,$hash,$role,$token]);

echo json_encode(["success" => true]);





?>