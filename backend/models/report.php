<?php
require_once __DIR__ . '/../config/database.php';

class Report {
    private $conn;
    public $empresa_id;
    public $tipo;
    public $relatorio;
    public $data_inicio;
    public $data_fim;
    
    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }
    
    public function generate() {
        $data = $this->fetchReportData();
        
        if ($this->tipo === 'pdf') {
            return $this->generatePDF($data);
        } else {
            return $this->generateExcel($data);
        }
    }
    
    private function fetchReportData() {
        switch ($this->relatorio) {
            case 'frota':
                return $this->getFleetReportData();
            case 'corridas':
                return $this->getRidesReportData();
            case 'financeiro':
                return $this->getFinancialReportData();
            case 'motoristas':
                return $this->getDriversReportData();
            default:
                return [];
        }
    }
    
    private function getFleetReportData() {
        $query = "SELECT 
                    v.matricula,
                    v.modelo,
                    v.tipo,
                    v.status_operacional,
                    COUNT(c.id) as total_corridas,
                    SUM(CASE WHEN c.status = 'concluida' THEN c.valor_final ELSE 0 END) as receita_total,
                    AVG(c.avaliacao_motorista) as avaliacao_media
                  FROM veiculos v
                  LEFT JOIN corridas c ON v.id = c.veiculo_id 
                    AND c.data_solicitacao BETWEEN :data_inicio AND :data_fim
                  WHERE v.empresa_id = :empresa_id
                  GROUP BY v.id
                  ORDER BY v.matricula";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':empresa_id', $this->empresa_id);
        $stmt->bindParam(':data_inicio', $this->data_inicio);
        $stmt->bindParam(':data_fim', $this->data_fim);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    private function generatePDF($data) {
        $filename = 'relatorio_' . $this->relatorio . '_' . date('Ymd_His') . '.pdf';
        $filepath = __DIR__ . '/../../downloads/' . $filename;
        
        $pdf = new FPDF();
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 16);
        
        // Título
        $pdf->Cell(0, 10, 'Relatório ' . ucfirst($this->relatorio), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, 'Período: ' . $this->data_inicio . ' a ' . $this->data_fim, 0, 1, 'C');
        $pdf->Ln(10);
        
        // Cabeçalho da tabela
        $pdf->SetFont('Arial', 'B', 10);
        if ($this->relatorio === 'frota') {
            $pdf->Cell(30, 10, 'Matrícula', 1);
            $pdf->Cell(40, 10, 'Modelo', 1);
            $pdf->Cell(30, 10, 'Status', 1);
            $pdf->Cell(30, 10, 'Corridas', 1);
            $pdf->Cell(40, 10, 'Receita (Kz)', 1);
            $pdf->Cell(30, 10, 'Avaliação', 1);
            $pdf->Ln();
            
            // Dados
            $pdf->SetFont('Arial', '', 10);
            foreach ($data as $row) {
                $pdf->Cell(30, 10, $row['matricula'], 1);
                $pdf->Cell(40, 10, $row['modelo'], 1);
                $pdf->Cell(30, 10, $row['status_operacional'], 1);
                $pdf->Cell(30, 10, $row['total_corridas'], 1);
                $pdf->Cell(40, 10, number_format($row['receita_total'], 2, ',', '.'), 1);
                $pdf->Cell(30, 10, number_format($row['avaliacao_media'], 1), 1);
                $pdf->Ln();
            }
        }
        
        // Rodapé
        $pdf->SetY(-15);
        $pdf->SetFont('Arial', 'I', 8);
        $pdf->Cell(0, 10, 'Gerado em ' . date('d/m/Y H:i:s'), 0, 0, 'C');
        
        $pdf->Output('F', $filepath);
        
        return [
            'success' => true,
            'filename' => $filename,
            'size' => filesize($filepath)
        ];
    }
    
    private function generateExcel($data) {
        $filename = 'relatorio_' . $this->relatorio . '_' . date('Ymd_His') . '.xlsx';
        $filepath = __DIR__ . '/../../downloads/' . $filename;
        
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Título
        $sheet->setCellValue('A1', 'Relatório ' . ucfirst($this->relatorio));
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal('center');
        
        $sheet->setCellValue('A2', 'Período: ' . $this->data_inicio . ' a ' . $this->data_fim);
        $sheet->mergeCells('A2:F2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal('center');
        
        // Cabeçalho
        $sheet->setCellValue('A4', 'Matrícula');
        $sheet->setCellValue('B4', 'Modelo');
        $sheet->setCellValue('C4', 'Status');
        $sheet->setCellValue('D4', 'Corridas');
        $sheet->setCellValue('E4', 'Receita (Kz)');
        $sheet->setCellValue('F4', 'Avaliação');
        
        // Estilo do cabeçalho
        $headerStyle = [
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => 'center'],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'color' => ['rgb' => 'CCCCCC']
            ]
        ];
        $sheet->getStyle('A4:F4')->applyFromArray($headerStyle);
        
        // Dados
        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, $item['matricula']);
            $sheet->setCellValue('B' . $row, $item['modelo']);
            $sheet->setCellValue('C' . $row, $item['status_operacional']);
            $sheet->setCellValue('D' . $row, $item['total_corridas']);
            $sheet->setCellValue('E' . $row, $item['receita_total']);
            $sheet->setCellValue('F' . $row, $item['avaliacao_media']);
            $row++;
        }
        
        // Auto tamanho das colunas
        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($filepath);
        
        return [
            'success' => true,
            'filename' => $filename,
            'size' => filesize($filepath)
        ];
    }
}
?>