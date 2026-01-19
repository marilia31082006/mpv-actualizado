<?php
function generateJWT($userId, $role){
    $header = base64_encode(json_encode(["alg" => "HS256", "typ" => "JWT"]));

    $payload = base64_encode(json_encode([
        "id" => $userId,
        "role" => $role,
        "exp" => time() + (60 * 60)
    ]));
    $secret = "KUMBI_SECRET_KEY";
    $signature = hash_hmac("sha256", "$header.$payload", $secret, true);
    $signature = base64_encode($signature);

    return "$header.$payload.$signature";
}