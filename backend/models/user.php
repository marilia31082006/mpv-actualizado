<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table = 'usuarios';
    
    public $id;
    public $nome;
    public $email;
    public $telefone;
    public $senha;
    public $tipo;
    public $avatar;
    public $data_nascimento;
    public $genero;
    public $documento_identificacao;
    public $carta_conducao;
    public $nif_empresa;
    public $endereco;
    public $cidade;
    public $provincia;
    public $latitude;
    public $longitude;
    public $ativo;
    public $verificado;
    
    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                  SET nome = :nome,
                      email = :email,
                      telefone = :telefone,
                      senha = :senha,
                      tipo = :tipo,
                      documento_identificacao = :documento_identificacao,
                      carta_conducao = :carta_conducao,
                      nif_empresa = :nif_empresa,
                      endereco = :endereco,
                      cidade = :cidade,
                      provincia = :provincia,
                      token_verificacao = :token_verificacao";
        
        $stmt = $this->conn->prepare($query);
        
        // Hash da senha
        $this->senha = password_hash($this->senha, PASSWORD_DEFAULT);
        $token = bin2hex(random_bytes(16));
        
        // Limpar dados
        $this->nome = htmlspecialchars(strip_tags($this->nome));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->telefone = htmlspecialchars(strip_tags($this->telefone));
        
        // Bind parameters
        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':telefone', $this->telefone);
        $stmt->bindParam(':senha', $this->senha);
        $stmt->bindParam(':tipo', $this->tipo);
        $stmt->bindParam(':documento_identificacao', $this->documento_identificacao);
        $stmt->bindParam(':carta_conducao', $this->carta_conducao);
        $stmt->bindParam(':nif_empresa', $this->nif_empresa);
        $stmt->bindParam(':endereco', $this->endereco);
        $stmt->bindParam(':cidade', $this->cidade);
        $stmt->bindParam(':provincia', $this->provincia);
        $stmt->bindParam(':token_verificacao', $token);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            
            // Criar registro adicional baseado no tipo
            if ($this->tipo === 'empresa') {
                $this->createEmpresa();
            } elseif ($this->tipo === 'motorista') {
                $this->createMotorista();
            } elseif ($this->tipo === 'passageiro') {
                $this->createCarteira();
            }
            
            // Enviar email de verificação
            if (ENABLE_EMAIL_VERIFICATION) {
                $this->sendVerificationEmail($token);
            }
            
            return true;
        }
        
        return false;
    }
    
    private function createEmpresa() {
        $query = "INSERT INTO empresas 
                  SET usuario_id = :usuario_id,
                      nome_empresa = :nome_empresa,
                      nif = :nif,
                      endereco = :endereco";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $this->id);
        $stmt->bindParam(':nome_empresa', $this->nome);
        $stmt->bindParam(':nif', $this->nif_empresa);
        $stmt->bindParam(':endereco', $this->endereco);
        
        return $stmt->execute();
    }
    
    private function createMotorista() {
        $query = "INSERT INTO motoristas 
                  SET usuario_id = :usuario_id,
                      carta_conducao = :carta_conducao";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $this->id);
        $stmt->bindParam(':carta_conducao', $this->carta_conducao);
        
        return $stmt->execute();
    }
    
    private function createCarteira() {
        $query = "INSERT INTO carteira 
                  SET usuario_id = :usuario_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $this->id);
        
        return $stmt->execute();
    }
    
    private function sendVerificationEmail($token) {
        // Implementação simplificada
        $verificationLink = BASE_URL . "/verify-email?token=" . $token;
        $subject = "Verifique seu email - " . APP_NAME;
        $message = "Olá " . $this->nome . ",\n\n";
        $message .= "Por favor, clique no link abaixo para verificar seu email:\n";
        $message .= $verificationLink . "\n\n";
        $message .= "Obrigado!";
        
        // Em produção, usar PHPMailer ou similar
        // mail($this->email, $subject, $message);
        error_log("Email de verificação enviado para: " . $this->email);
    }
    
    public function login($email, $password) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE email = :email AND ativo = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($password, $row['senha'])) {
                // Atualizar último login
                $this->updateLastLogin($row['id']);
                
                // Gerar token JWT
                $token = AuthMiddleware::generateToken(
                    $row['id'], 
                    $row['tipo'], 
                    $row['email']
                );
                
                return [
                    'token' => $token,
                    'user' => [
                        'id' => $row['id'],
                        'nome' => $row['nome'],
                        'email' => $row['email'],
                        'tipo' => $row['tipo'],
                        'avatar' => $row['avatar'],
                        'cidade' => $row['cidade'],
                        'provincia' => $row['provincia'],
                        'verificado' => (bool)$row['verificado']
                    ]
                ];
            }
        }
        
        return false;
    }
    
    private function updateLastLogin($userId) {
        $query = "UPDATE " . $this->table . " 
                  SET ultimo_login = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
    }
    
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE id = :id AND ativo = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return false;
    }
    
    public function updateLocation($userId, $latitude, $longitude) {
        $query = "UPDATE " . $this->table . " 
                  SET latitude = :latitude, 
                      longitude = :longitude 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->bindParam(':latitude', $latitude);
        $stmt->bindParam(':longitude', $longitude);
        
        return $stmt->execute();
    }
    
    public function verifyEmail($token) {
        $query = "UPDATE " . $this->table . " 
                  SET verificado = 1, 
                      token_verificacao = NULL 
                  WHERE token_verificacao = :token";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        
        return false;
    }
    
    public function requestPasswordReset($email) {
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE email = :email AND ativo = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $token = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $updateQuery = "UPDATE " . $this->table . " 
                           SET token_recuperacao = :token,
                               data_expiracao_token = :expiry 
                           WHERE id = :id";
            
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':token', $token);
            $updateStmt->bindParam(':expiry', $expiry);
            $updateStmt->bindParam(':id', $row['id']);
            
            if ($updateStmt->execute()) {
                // Enviar email com link de recuperação
                $resetLink = BASE_URL . "/reset-password?token=" . $token;
                // Implementar envio de email
                return true;
            }
        }
        
        return false;
    }
    
    public function resetPassword($token, $newPassword) {
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE token_recuperacao = :token 
                  AND data_expiracao_token > NOW()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            $updateQuery = "UPDATE " . $this->table . " 
                           SET senha = :senha,
                               token_recuperacao = NULL,
                               data_expiracao_token = NULL 
                           WHERE id = :id";
            
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':senha', $hashedPassword);
            $updateStmt->bindParam(':id', $row['id']);
            
            return $updateStmt->execute();
        }
        
        return false;
    }
    
    public function emailExists($email) {
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE email = :email";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}
?>