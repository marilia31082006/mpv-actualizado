-- Database: kuvika
CREATE DATABASE IF NOT EXISTS kuvika 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE kuvika;

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('passageiro', 'motorista', 'empresa') NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default.png',
    data_nascimento DATE,
    genero ENUM('M', 'F', 'O'),
    documento_identificacao VARCHAR(50),
    carta_conducao VARCHAR(50),
    nif_empresa VARCHAR(50),
    endereco VARCHAR(255),
    cidade VARCHAR(50) DEFAULT 'Luanda',
    provincia ENUM('Luanda', 'Icolo e Bengo') DEFAULT 'Luanda',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME,
    ativo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacao VARCHAR(100),
    token_recuperacao VARCHAR(100),
    data_expiracao_token DATETIME,
    
    INDEX idx_email (email),
    INDEX idx_tipo (tipo),
    INDEX idx_cidade (cidade),
    INDEX idx_provincia (provincia),
    SPATIAL INDEX idx_localizacao (latitude, longitude)
);

-- Tabela de empresas
CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNIQUE,
    nome_empresa VARCHAR(100) NOT NULL,
    nif VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    endereco VARCHAR(255),
    telefone_empresa VARCHAR(20),
    email_empresa VARCHAR(100),
    website VARCHAR(100),
    logo VARCHAR(255),
    data_registro DATE,
    licenca_operacao VARCHAR(100),
    status ENUM('ativa', 'pendente', 'suspensa', 'inativa') DEFAULT 'pendente',
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_nif (nif),
    INDEX idx_status (status)
);

-- Tabela de veículos
CREATE TABLE veiculos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    marca VARCHAR(50),
    ano_fabricacao YEAR,
    cor VARCHAR(30),
    capacidade INT DEFAULT 15,
    tipo ENUM('taxi', 'van', 'onibus', 'micro_onibus') DEFAULT 'van',
    numero_assentos INT,
    foto_frente VARCHAR(255),
    foto_traseira VARCHAR(255),
    foto_interna VARCHAR(255),
    status ENUM('ativo', 'manutencao', 'inativo', 'desativado') DEFAULT 'ativo',
    status_operacional ENUM('livre', 'cheio', 'em_rota', 'avariado') DEFAULT 'livre',
    combustivel ENUM('gasolina', 'diesel', 'electrico', 'hibrido') DEFAULT 'diesel',
    nivel_combustivel DECIMAL(5,2) DEFAULT 100.00,
    ultima_localizacao POINT,
    ultima_atualizacao DATETIME,
    data_inspecao DATE,
    proxima_inspecao DATE,
    observacoes TEXT,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_matricula (matricula),
    INDEX idx_status_operacional (status_operacional),
    INDEX idx_tipo (tipo),
    SPATIAL INDEX idx_ultima_localizacao (ultima_localizacao)
);

-- Tabela de motoristas
CREATE TABLE motoristas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNIQUE,
    empresa_id INT,
    veiculo_id INT,
    carta_conducao VARCHAR(50) UNIQUE NOT NULL,
    categoria_carta ENUM('A', 'B', 'C', 'D', 'E') DEFAULT 'D',
    data_validade_carta DATE,
    disponivel BOOLEAN DEFAULT TRUE,
    status ENUM('ativo', 'ferias', 'licenca', 'inativo') DEFAULT 'ativo',
    avaliacao_media DECIMAL(3,2) DEFAULT 5.00,
    total_viagens INT DEFAULT 0,
    total_avaliacoes INT DEFAULT 0,
    horas_trabalho DECIMAL(5,2) DEFAULT 0.00,
    salario_base DECIMAL(10,2),
    data_admissao DATE,
    data_demissao DATE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE SET NULL,
    INDEX idx_carta_conducao (carta_conducao),
    INDEX idx_disponivel (disponivel)
);

-- ============================================
-- TABELAS DE OPERAÇÃO
-- ============================================

-- Tabela de rotas
CREATE TABLE rotas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    tipo ENUM('urbana', 'interurbana', 'escolar', 'empresarial') DEFAULT 'urbana',
    origem VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    distancia_km DECIMAL(6,2),
    duracao_estimada_min INT,
    pontos_parada JSON,
    horarios JSON,
    tarifa_base DECIMAL(8,2) NOT NULL,
    tarifa_por_km DECIMAL(6,2),
    tarifa_por_minuto DECIMAL(6,2),
    status ENUM('ativa', 'inativa', 'suspensa') DEFAULT 'ativa',
    popularidade INT DEFAULT 0,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao DATETIME,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_codigo (codigo),
    INDEX idx_status (status),
    INDEX idx_origem_destino (origem, destino)
);

-- Tabela de corridas
CREATE TABLE corridas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    passageiro_id INT NOT NULL,
    motorista_id INT,
    veiculo_id INT,
    rota_id INT,
    
    origem_endereco VARCHAR(255) NOT NULL,
    origem_latitude DECIMAL(10, 8),
    origem_longitude DECIMAL(11, 8),
    
    destino_endereco VARCHAR(255) NOT NULL,
    destino_latitude DECIMAL(10, 8),
    destino_longitude DECIMAL(11, 8),
    
    distancia_estimada_km DECIMAL(6,2),
    duracao_estimada_min INT,
    distancia_real_km DECIMAL(6,2),
    duracao_real_min INT,
    
    valor_estimado DECIMAL(10,2) NOT NULL,
    valor_final DECIMAL(10,2),
    taxa_servico DECIMAL(8,2) DEFAULT 0.00,
    
    status ENUM(
        'solicitada', 
        'aceita', 
        'motorista_a_caminho', 
        'em_andamento', 
        'concluida', 
        'cancelada', 
        'rejeitada'
    ) DEFAULT 'solicitada',
    
    motivo_cancelamento TEXT,
    cancelado_por ENUM('passageiro', 'motorista', 'sistema'),
    
    forma_pagamento ENUM('dinheiro', 'cartao', 'carteira', 'multicaixa') DEFAULT 'dinheiro',
    status_pagamento ENUM('pendente', 'pago', 'falhou', 'reembolsado') DEFAULT 'pendente',
    
    passageiros INT DEFAULT 1,
    bagagem ENUM('nenhuma', 'pequena', 'media', 'grande') DEFAULT 'nenhuma',
    
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_aceitacao DATETIME,
    data_inicio DATETIME,
    data_conclusao DATETIME,
    data_cancelamento DATETIME,
    
    avaliacao_motorista TINYINT,
    avaliacao_passageiro TINYINT,
    comentario_motorista TEXT,
    comentario_passageiro TEXT,
    
    FOREIGN KEY (passageiro_id) REFERENCES usuarios(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    FOREIGN KEY (rota_id) REFERENCES rotas(id),
    
    INDEX idx_codigo (codigo),
    INDEX idx_passageiro_id (passageiro_id),
    INDEX idx_motorista_id (motorista_id),
    INDEX idx_status (status),
    INDEX idx_data_solicitacao (data_solicitacao),
    SPATIAL INDEX idx_origem (origem_latitude, origem_longitude),
    SPATIAL INDEX idx_destino (destino_latitude, destino_longitude)
);

-- Tabela de localizações em tempo real
CREATE TABLE localizacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    veiculo_id INT,
    motorista_id INT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    velocidade DECIMAL(5,2),
    direcao DECIMAL(5,2),
    precisao DECIMAL(5,2),
    bateria_nivel TINYINT,
    conexao_tipo ENUM('wifi', '4g', '3g', '2g'),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    
    INDEX idx_timestamp (timestamp),
    INDEX idx_usuario_veiculo (usuario_id, veiculo_id),
    SPATIAL INDEX idx_coordenadas (latitude, longitude)
);

-- ============================================
-- TABELAS DE SUPORTE
-- ============================================

-- Tabela de pagamentos
CREATE TABLE pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    corrida_id INT UNIQUE,
    usuario_id INT,
    referencia VARCHAR(50) UNIQUE NOT NULL,
    metodo ENUM('multicaixa', 'referencia', 'transferencia', 'cartao') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    taxa DECIMAL(8,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'processando', 'concluido', 'falhou', 'reembolsado') DEFAULT 'pendente',
    dados_transacao JSON,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME,
    data_conclusao DATETIME,
    
    FOREIGN KEY (corrida_id) REFERENCES corridas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_referencia (referencia),
    INDEX idx_status (status)
);

-- Tabela de carteira digital
CREATE TABLE carteira (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNIQUE,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    saldo_bloqueado DECIMAL(10,2) DEFAULT 0.00,
    limite_diario DECIMAL(10,2) DEFAULT 50000.00,
    total_depositado DECIMAL(15,2) DEFAULT 0.00,
    total_retirado DECIMAL(15,2) DEFAULT 0.00,
    total_gasto DECIMAL(15,2) DEFAULT 0.00,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao DATETIME,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de transações da carteira
CREATE TABLE transacoes_carteira (
    id INT PRIMARY KEY AUTO_INCREMENT,
    carteira_id INT NOT NULL,
    tipo ENUM('deposito', 'retirada', 'pagamento', 'reembolso', 'bonus') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    saldo_anterior DECIMAL(10,2) NOT NULL,
    saldo_atual DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(255),
    referencia VARCHAR(100),
    metadata JSON,
    status ENUM('pendente', 'concluido', 'falhou', 'cancelado') DEFAULT 'concluido',
    data_transacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (carteira_id) REFERENCES carteira(id),
    INDEX idx_tipo (tipo),
    INDEX idx_data (data_transacao)
);

-- Tabela de favoritos
CREATE TABLE favoritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('rota', 'local', 'motorista') NOT NULL,
    rota_id INT,
    nome_local VARCHAR(100),
    endereco_local VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    motorista_id INT,
    data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (rota_id) REFERENCES rotas(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    
    UNIQUE KEY idx_favorito_unico (usuario_id, tipo, rota_id, nome_local, motorista_id),
    INDEX idx_usuario_tipo (usuario_id, tipo)
);

-- Tabela de relatórios de problemas
CREATE TABLE reportes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('veiculo', 'motorista', 'rota', 'app', 'outro') NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    veiculo_id INT,
    motorista_id INT,
    rota_id INT,
    status ENUM('aberto', 'em_analise', 'resolvido', 'fechado') DEFAULT 'aberto',
    prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
    data_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_resolucao DATETIME,
    resolucao TEXT,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    FOREIGN KEY (rota_id) REFERENCES rotas(id),
    
    INDEX idx_status (status),
    INDEX idx_tipo (tipo),
    INDEX idx_data (data_reporte)
);

-- Tabela de mensagens/alertas
CREATE TABLE mensagens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    remetente_id INT,
    destinatario_id INT,
    empresa_id INT,
    tipo ENUM('alerta', 'mensagem', 'notificacao') DEFAULT 'mensagem',
    titulo VARCHAR(100),
    conteudo TEXT NOT NULL,
    prioridade ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
    lida BOOLEAN DEFAULT FALSE,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_leitura DATETIME,
    
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    
    INDEX idx_destinatario (destinatario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_lida (lida)
);

-- Tabela de histórico de status de veículos
CREATE TABLE historico_status_veiculos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    veiculo_id INT NOT NULL,
    status_antigo ENUM('livre', 'cheio', 'em_rota', 'avariado'),
    status_novo ENUM('livre', 'cheio', 'em_rota', 'avariado') NOT NULL,
    motorista_id INT,
    corrida_id INT,
    observacao TEXT,
    data_mudanca DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    FOREIGN KEY (corrida_id) REFERENCES corridas(id),
    
    INDEX idx_veiculo_data (veiculo_id, data_mudanca),
    INDEX idx_status_novo (status_novo)
);

-- ============================================
-- VIEWS E PROCEDURES
-- ============================================

-- View para dashboard da empresa
CREATE VIEW view_dashboard_empresa AS
SELECT 
    e.id as empresa_id,
    e.nome_empresa,
    COUNT(DISTINCT v.id) as total_veiculos,
    COUNT(DISTINCT CASE WHEN v.status_operacional = 'ativo' THEN v.id END) as veiculos_ativos,
    COUNT(DISTINCT m.id) as total_motoristas,
    COUNT(DISTINCT CASE WHEN m.disponivel = 1 THEN m.id END) as motoristas_disponiveis,
    COUNT(DISTINCT r.id) as total_rotas,
    COALESCE(SUM(CASE WHEN c.status = 'concluida' THEN c.valor_final ELSE 0 END), 0) as receita_total,
    COUNT(DISTINCT CASE WHEN c.status = 'concluida' THEN c.id END) as corridas_concluidas
FROM empresas e
LEFT JOIN veiculos v ON e.id = v.empresa_id
LEFT JOIN motoristas m ON e.id = m.empresa_id
LEFT JOIN rotas r ON e.id = r.empresa_id
LEFT JOIN corridas c ON v.id = c.veiculo_id AND c.data_solicitacao >= CURDATE()
GROUP BY e.id;

-- View para estatísticas de motoristas
CREATE VIEW view_estatisticas_motoristas AS
SELECT 
    m.id as motorista_id,
    u.nome,
    m.avaliacao_media,
    m.total_viagens,
    m.horas_trabalho,
    COUNT(DISTINCT CASE WHEN c.status = 'concluida' THEN c.id END) as corridas_concluidas_hoje,
    COALESCE(SUM(CASE WHEN c.status = 'concluida' THEN c.valor_final ELSE 0 END), 0) as receita_hoje
FROM motoristas m
JOIN usuarios u ON m.usuario_id = u.id
LEFT JOIN corridas c ON m.id = c.motorista_id AND DATE(c.data_solicitacao) = CURDATE()
GROUP BY m.id;

-- Procedure para atualizar localização
DELIMITER //
CREATE PROCEDURE atualizar_localizacao(
    IN p_veiculo_id INT,
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_velocidade DECIMAL(5,2),
    IN p_direcao DECIMAL(5,2)
)
BEGIN
    -- Atualizar tabela de localizações
    INSERT INTO localizacoes (veiculo_id, latitude, longitude, velocidade, direcao, timestamp)
    VALUES (p_veiculo_id, p_latitude, p_longitude, p_velocidade, p_direcao, NOW());
    
    -- Atualizar última localização do veículo
    UPDATE veiculos 
    SET ultima_localizacao = POINT(p_latitude, p_longitude),
        ultima_atualizacao = NOW()
    WHERE id = p_veiculo_id;
END //
DELIMITER ;

-- Trigger para atualizar avaliação média do motorista
DELIMITER //
CREATE TRIGGER after_insert_avaliacao_corrida
AFTER UPDATE ON corridas
FOR EACH ROW
BEGIN
    IF NEW.avaliacao_motorista IS NOT NULL AND OLD.avaliacao_motorita IS NULL THEN
        UPDATE motoristas m
        SET m.total_avaliacoes = m.total_avaliacoes + 1,
            m.avaliacao_media = (
                (m.avaliacao_media * m.total_avaliacoes + NEW.avaliacao_motorista) / 
                (m.total_avaliacoes + 1)
            )
        WHERE m.id = NEW.motorista_id;
    END IF;
END //
DELIMITER ;

-- ============================================
-- INSERÇÃO DE DADOS DE TESTE
-- ============================================

-- Inserir uma empresa de teste
INSERT INTO usuarios (nome, email, telefone, senha, tipo, nif_empresa, endereco, cidade, provincia, verificado, ativo) 
VALUES (
    'Transangol Transportes',
    'admin@transangol.ao',
    '+244 923 456 789',
    '$2y$10$YourHashedPasswordHere', -- senha: 12345678
    'empresa',
    '5001234567',
    'Avenida 4 de Fevereiro, 123',
    'Luanda',
    'Luanda',
    TRUE,
    TRUE
);

SET @empresa_user_id = LAST_INSERT_ID();

INSERT INTO empresas (usuario_id, nome_empresa, nif, endereco, telefone_empresa, email_empresa, status)
VALUES (
    @empresa_user_id,
    'Transangol Transportes',
    '5001234567',
    'Avenida 4 de Fevereiro, 123',
    '+244 222 333 444',
    'info@transangol.ao',
    'ativa'
);

SET @empresa_id = LAST_INSERT_ID();

-- Inserir veículos de teste
INSERT INTO veiculos (empresa_id, matricula, modelo, marca, ano_fabricacao, cor, capacidade, tipo, status_operacional)
VALUES 
(@empresa_id, 'LD-1234-LA', 'Toyota Hiace', 'Toyota', 2020, 'Branco', 15, 'van', 'livre'),
(@empresa_id, 'LD-5678-LD', 'Mercedes Sprinter', 'Mercedes', 2019, 'Azul', 18, 'van', 'em_rota'),
(@empresa_id, 'LD-9012-LU', 'Coaster', 'Toyota', 2021, 'Verde', 25, 'onibus', 'cheio'),
(@empresa_id, 'LD-3456-LA', 'Van', 'Renault', 2022, 'Amarelo', 8, 'taxi', 'livre');

-- Inserir motoristas de teste
INSERT INTO usuarios (nome, email, telefone, senha, tipo, documento_identificacao, carta_conducao, cidade, provincia, verificado, ativo)
VALUES 
('João Fernandes', 'joao@transangol.ao', '+244 912 345 678', '$2y$10$YourHashedPasswordHere', 'motorista', '123456789LA123', 'CD-00123', 'Luanda', 'Luanda', TRUE, TRUE),
('Maria Santos', 'maria@transangol.ao', '+244 923 456 789', '$2y$10$YourHashedPasswordHere', 'motorista', '987654321LA456', 'CD-00456', 'Luanda', 'Luanda', TRUE, TRUE);

INSERT INTO motoristas (usuario_id, empresa_id, veiculo_id, carta_conducao, categoria_carta, disponivel, avaliacao_media, total_viagens)
VALUES 
(LAST_INSERT_ID()-1, @empresa_id, 1, 'CD-00123', 'D', TRUE, 4.8, 124),
(LAST_INSERT_ID(), @empresa_id, 2, 'CD-00456', 'D', FALSE, 4.9, 89);

-- Inserir rotas de teste
INSERT INTO rotas (empresa_id, nome, codigo, origem, destino, distancia_km, duracao_estimada_min, tarifa_base, status)
VALUES 
(@empresa_id, 'Linha 5 - Centro', 'L05', 'Centro', 'Benfica', 12.5, 35, 250.00, 'ativa'),
(@empresa_id, 'Linha 2 - UFP', 'L02', 'UFP', 'Kilamba', 8.2, 25, 180.00, 'ativa'),
(@empresa_id, 'Linha 8 - Marginal', 'L08', 'Marginal', 'Viana', 15.3, 45, 320.00, 'ativa');

-- Inserir um passageiro de teste
INSERT INTO usuarios (nome, email, telefone, senha, tipo, cidade, provincia, verificado, ativo)
VALUES (
    'Carlos Silva',
    'carlos@email.com',
    '+244 934 567 890',
    '$2y$10$YourHashedPasswordHere',
    'passageiro',
    'Luanda',
    'Luanda',
    TRUE,
    TRUE
);

-- Criar carteira para o passageiro
INSERT INTO carteira (usuario_id, saldo, limite_diario)
VALUES (LAST_INSERT_ID(), 5000.00, 50000.00);

-- Inserir uma corrida de teste
INSERT INTO corridas (
    codigo, passageiro_id, motorista_id, veiculo_id, rota_id,
    origem_endereco, destino_endereco, distancia_estimada_km, duracao_estimada_min,
    valor_estimado, status, forma_pagamento, data_solicitacao
)
VALUES (
    'CORR-2024-001',
    3, -- passageiro_id
    1, -- motorista_id
    1, -- veiculo_id
    1, -- rota_id
    'Avenida 4 de Fevereiro, Luanda',
    'Benfica, Luanda',
    12.5,
    35,
    250.00,
    'concluida',
    'dinheiro',
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
);