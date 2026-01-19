<?php
require "..config/db.php";
require "jwt.php";

$data = json_decode(file_get_contents("php://input"),true);

$email = $data['email'];
$pass = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
$stmt -> execute([$email]);
$user = $stmt->fetch();

if(!$user || !password_verify($pass, $user['password'])){
    http_response_code(401);
    echo json_encode(["error" => "Email não verificado"]);

    exit;
}

$token = generateJWT($user['id'], $user['role']);
echo json_encode([
    "token" => $token,
    "role" => $user['role']
]);



?>