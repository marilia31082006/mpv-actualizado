<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';

header('Content-Type: application/json');

// Receber dados do POST
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

// Validar entrada
$rules = [
    'nome' => 'required|min:3',
    'email' => 'required|email',
    'telefone' => 'required|phone',
    'senha' => 'required|min:8',
    'tipo' => 'required|in:passageiro,motorista,empresa'
];

validateInput($data, $rules);

// Verificar se email já existe
$user = new User();
if ($user->emailExists($data['email'])) {
    jsonResponse(false, 'Email já está registrado', null, 409);
}

// Dados adicionais baseados no tipo
$additionalData = [];
if ($data['tipo'] === 'motorista') {
    if (empty($data['carta_conducao'])) {
        jsonResponse(false, 'Carta de condução é obrigatória para motoristas', null, 400);
    }
    $additionalData['carta_conducao'] = $data['carta_conducao'];
    $additionalData['documento_identificacao'] = $data['documento_identificacao'] ?? '';
} 
elseif ($data['tipo'] === 'empresa') {
    if (empty($data['nif_empresa'])) {
        jsonResponse(false, 'NIF da empresa é obrigatório', null, 400);
    }
    $additionalData['nif_empresa'] = $data['nif_empresa'];
}

// Criar novo usuário
$user->nome = $data['nome'];
$user->email = $data['email'];
$user->telefone = $data['telefone'];
$user->senha = $data['senha'];
$user->tipo = $data['tipo'];
$user->documento_identificacao = $additionalData['documento_identificacao'] ?? '';
$user->carta_conducao = $additionalData['carta_conducao'] ?? '';
$user->nif_empresa = $additionalData['nif_empresa'] ?? '';
$user->endereco = $data['endereco'] ?? '';
$user->cidade = $data['cidade'] ?? 'Luanda';
$user->provincia = $data['provincia'] ?? 'Luanda';

if ($user->create()) {
    $response = [
        'id' => $user->id,
        'nome' => $user->nome,
        'email' => $user->email,
        'tipo' => $user->tipo,
        'mensagem' => ENABLE_EMAIL_VERIFICATION 
            ? 'Usuário criado com sucesso! Verifique seu email para ativar a conta.' 
            : 'Usuário criado com sucesso!'
    ];
    
    jsonResponse(true, 'Registro realizado com sucesso', $response, 201);
} else {
    jsonResponse(false, 'Erro ao criar usuário', null, 500);
}
?>