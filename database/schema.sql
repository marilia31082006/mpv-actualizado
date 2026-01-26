-- database/kumbi_database.sql
CREATE DATABASE IF NOT EXISTS kumbi_transporte;
USE kumbi_transporte;

-- Tabela de usuários (empresas, motoristas, passageiros)
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('empresa', 'motorista', 'passageiro') NOT NULL,
    empresa_id INT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_reset VARCHAR(255) NULL,
    token_expira TIMESTAMP NULL
);

-- Tabela de empresas
CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de veículos
CREATE TABLE veiculos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(50),
    capacidade INT DEFAULT 40,
    status ENUM('ativo', 'inativo', 'manutencao') DEFAULT 'ativo',
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Tabela de rotas
CREATE TABLE rotas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    origem VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    tempo_estimado INT, -- em minutos
    ativa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Tabela de viagens em tempo real
CREATE TABLE viagens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    veiculo_id INT NOT NULL,
    rota_id INT NOT NULL,
    motorista_id INT NOT NULL,
    status ENUM('em_rota', 'finalizada', 'cancelada') DEFAULT 'em_rota',
    lotacao_atual INT DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hora_partida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_chegada TIMESTAMP NULL,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    FOREIGN KEY (rota_id) REFERENCES rotas(id),
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
);

-- Tabela de alertas
CREATE TABLE alertas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo ENUM('atraso', 'veiculo_indisponivel', 'emergencia', 'manutencao') NOT NULL,
    descricao TEXT,
    veiculo_id INT NULL,
    rota_id INT NULL,
    resolvido BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    FOREIGN KEY (rota_id) REFERENCES rotas(id)
);

-- Tabela de histórico de localização
CREATE TABLE historico_localizacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    viagem_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viagem_id) REFERENCES viagens(id)
);

-- Tabela de mensagens para motoristas
CREATE TABLE mensagens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    motorista_id INT NULL,
    veiculo_id INT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
);

-- Inserir dados de exemplo
INSERT INTO empresas (nome, cnpj, telefone) VALUES 
('Kumbi Transportes', '12.345.678/0001-90', '+244 923 456 789');

INSERT INTO usuarios (email, senha_hash, nome, tipo, empresa_id) VALUES
('admin@kumbi.com', '$2y$10$YourHashedPasswordHere', 'Administrador Kumbi', 'empresa', 1),
('motorista1@kumbi.com', '$2y$10$YourHashedPasswordHere', 'João Silva', 'motorista', 1),
('motorista2@kumbi.com', '$2y$10$YourHashedPasswordHere', 'Maria Santos', 'motorista', 1);

INSERT INTO veiculos (empresa_id, placa, modelo, capacidade) VALUES
(1, 'LD-01-23-AB', 'Mercedes-Benz Sprinter', 40),
(1, 'LD-02-45-CD', 'Toyota Hiace', 30);

INSERT INTO rotas (empresa_id, nome, origem, destino, tempo_estimado) VALUES
(1, 'Linha 5 - Centro', 'UFP', 'Centro', 6),
(1, 'Linha 2 - UFP', 'Centro', 'UFP', 12);

INSERT INTO alertas (empresa_id, tipo, descricao, veiculo_id, rota_id) VALUES
(1, 'atraso', 'Atraso de 15 minutos na Linha 5', 1, 1),
(1, 'veiculo_indisponivel', 'Veículo em manutenção', 2, NULL),
(1, 'emergencia', 'Passageiro necessita de assistência', 1, 1);