<?php
require_once __DIR__ . '/../config/config.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? $_GET['token'] ?? null;
        
        if (!$token) {
            jsonResponse(false, 'Token de autenticação não fornecido', null, 401);
        }
        
        // Remover "Bearer " se presente
        $token = str_replace('Bearer ', '', $token);
        
        try {
            $decoded = self::verifyToken($token);
            return $decoded;
        } catch (Exception $e) {
            jsonResponse(false, 'Token inválido ou expirado: ' . $e->getMessage(), null, 401);
        }
    }
    
    private static function verifyToken($token) {
        // Verificar se é um token JWT válido
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new Exception('Token malformado');
        }
        
        // Decodificar payload
        $payload = json_decode(base64_decode($parts[1]), true);
        
        if (!$payload) {
            throw new Exception('Payload inválido');
        }
        
        // Verificar expiração
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expirado');
        }
        
        return $payload;
    }
    
    public static function generateToken($userId, $userType, $email) {
        $payload = [
            'iss' => BASE_URL,
            'aud' => BASE_URL,
            'iat' => time(),
            'exp' => time() + JWT_EXPIRATION,
            'user_id' => $userId,
            'user_type' => $userType,
            'email' => $email
        ];
        
        $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
        $payload = json_encode($payload);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    public static function checkUserType($allowedTypes) {
        $user = self::authenticate();
        
        if (!in_array($user['user_type'], $allowedTypes)) {
            jsonResponse(false, 'Acesso não autorizado para este tipo de usuário', null, 403);
        }
        
        return $user;
    }
}
?>