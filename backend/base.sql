create TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome varchar(100) NOT NULL,
    email varchar(150) NOT NULL UNIQUE,
    senha varchar(255) NOT NULL,
    role ENUM('empresa', 'cidadao') NOT NULL,
    email_verified TINYINT(1) DEFAULT 0,
    verification_token varchar(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP0
);