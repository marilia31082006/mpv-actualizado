<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../libs/fpdf/fpdf.php';
require_once __DIR__ . '/../../libs/phpspreadsheet/vendor/autoload.php';

header('Content-Type: application/json');

// Autenticar empresa
$authUser = AuthMiddleware::checkUserType(['empresa']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido', null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$rules = [
    'tipo' => 'required|in:pdf,excel',
    'relatorio' => 'required|in:frota,corridas,financeiro,motoristas',
    'data_inicio' => 'required|date',
    'data_fim' => 'required|date'
];

validateInput($data, $rules);

$report = new Report();
$report->empresa_id = $authUser['user_id'];
$report->tipo = $data['tipo'];
$report->relatorio = $data['relatorio'];
$report->data_inicio = $data['data_inicio'];
$report->data_fim = $data['data_fim'];

// Gerar relatório
$result = $report->generate();

if ($result['success']) {
    $response = [
        'filename' => $result['filename'],
        'download_url' => BASE_URL . '/downloads/' . $result['filename'],
        'size' => $result['size'],
        'generated_at' => date('Y-m-d H:i:s')
    ];
    
    jsonResponse(true, 'Relatório gerado com sucesso', $response, 200);
} else {
    jsonResponse(false, 'Erro ao gerar relatório', null, 500);
}
?>