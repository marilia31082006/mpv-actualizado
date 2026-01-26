<?php
// Configurações da aplicação
define('APP_NAME', 'KUVIKA');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development, testing, production

// Configurações de URL
define('BASE_URL', 'http://localhost/kuvika');
define('API_URL', BASE_URL . '/backend/api');

// Configurações de segurança
define('JWT_SECRET', 'your-secret-key-change-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 horas

// Configurações de upload
define('MAX_UPLOAD_SIZE', 5242880); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif']);
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');

// Configurações de email (exemplo usando SMTP)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-password');
define('SMTP_FROM', 'no-reply@kuvika.ao');
define('SMTP_FROM_NAME', 'KUVIKA Sistema');

// Configurações de pagamento (Multicaixa)
define('MULTICAIXA_API_KEY', 'your-multicaixa-api-key');
define('MULTICAIXA_MERCHANT_ID', 'your-merchant-id');

// Habilitar/desabilitar funcionalidades
define('ENABLE_EMAIL_VERIFICATION', true);
define('ENABLE_SMS_VERIFICATION', false);
define('ENABLE_PUSH_NOTIFICATIONS', false);

// Taxas e valores
define('TAXA_SERVICO_PERCENT', 10); // 10%
define('TAXA_SERVICO_MINIMA', 50.00); // 50 Kz
define('TAXA_CANCELAMENTO_PERCENT', 20); // 20%
define('PRECO_MINIMO_CORRIDA', 150.00); // 150 Kz

// Configurações do mapa
define('MAP_LATITUDE_CENTER', -8.8383);
define('MAP_LONGITUDE_CENTER', 13.2344);
define('MAP_DEFAULT_ZOOM', 12);
define('MAP_BOUNDS_SW_LAT', -9.0);
define('MAP_BOUNDS_SW_LNG', 12.5);
define('MAP_BOUNDS_NE_LAT', -8.5);
define('MAP_BOUNDS_NE_LNG', 13.8);

// Timezone de Angola
date_default_timezone_set('Africa/Luanda');

// Habilitar CORS para desenvolvimento
if (APP_ENV === 'development') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// Lidar com preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Função para gerar respostas JSON padronizadas
function jsonResponse($success, $message = '', $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    $response = [
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// Função para validar entrada
function validateInput($data, $rules) {
    $errors = [];
    
    foreach ($rules as $field => $rule) {
        $value = $data[$field] ?? null;
        
        // Verificar campo obrigatório
        if (strpos($rule, 'required') !== false && empty($value)) {
            $errors[$field] = "O campo $field é obrigatório";
            continue;
        }
        
        if (empty($value)) continue;
        
        // Validar email
        if (strpos($rule, 'email') !== false && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $errors[$field] = "Email inválido";
        }
        
        // Validar telefone (formato angolano)
        if (strpos($rule, 'phone') !== false && !preg_match('/^\+244[0-9]{9}$/', $value)) {
            $errors[$field] = "Telefone inválido. Formato: +244XXXXXXXXX";
        }
        
        // Validar tamanho mínimo
        if (preg_match('/min:(\d+)/', $rule, $matches)) {
            $min = $matches[1];
            if (strlen($value) < $min) {
                $errors[$field] = "O campo $field deve ter pelo menos $min caracteres";
            }
        }
    }
    
    if (!empty($errors)) {
        jsonResponse(false, 'Erro de validação', $errors, 400);
    }
}

// Função para gerar tokens
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Função para upload de arquivos
function uploadFile($file, $directory, $allowedTypes = null) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Erro no upload do arquivo");
    }
    
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        throw new Exception("Arquivo muito grande. Máximo: " . (MAX_UPLOAD_SIZE / 1024 / 1024) . "MB");
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($allowedTypes && !in_array($extension, $allowedTypes)) {
        throw new Exception("Tipo de arquivo não permitido");
    }
    
    $filename = uniqid() . '.' . $extension;
    $destination = UPLOAD_DIR . $directory . '/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception("Falha ao salvar arquivo");
    }
    
    return $filename;
}

// Função para sanitizar entrada
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>