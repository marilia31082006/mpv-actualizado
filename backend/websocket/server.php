<?php
require __DIR__ . '/../config/config.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class KuvikaWebSocket implements MessageComponentInterface {
    protected $clients;
    protected $userConnections; // user_id => connection

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->userConnections = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "Nova conexão: {$conn->resourceId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        
        if (!$data || !isset($data['type'])) {
            return;
        }

        switch ($data['type']) {
            case 'auth':
                $this->handleAuth($from, $data);
                break;
                
            case 'subscribe':
                $this->handleSubscribe($from, $data);
                break;
                
            case 'location_update':
                $this->handleLocationUpdate($from, $data);
                break;
                
            case 'ride_update':
                $this->handleRideUpdate($from, $data);
                break;
        }
    }

    private function handleAuth(ConnectionInterface $conn, $data) {
        // Verificar token JWT
        $token = $data['token'] ?? '';
        $user = $this->verifyToken($token);
        
        if ($user) {
            $this->userConnections[$user['user_id']] = $conn;
            $conn->send(json_encode([
                'type' => 'auth_success',
                'user_id' => $user['user_id'],
                'user_type' => $user['user_type']
            ]));
            
            echo "Usuário autenticado: {$user['user_id']}\n";
        } else {
            $conn->send(json_encode([
                'type' => 'auth_error',
                'message' => 'Token inválido'
            ]));
            $conn->close();
        }
    }

    private function handleSubscribe(ConnectionInterface $conn, $data) {
        $channels = $data['channels'] ?? [];
        
        foreach ($channels as $channel) {
            $conn->channels[$channel] = true;
        }
        
        $conn->send(json_encode([
            'type' => 'subscribed',
            'channels' => $channels
        ]));
    }

    private function handleLocationUpdate(ConnectionInterface $conn, $data) {
        $userId = $data['user_id'];
        $location = $data['location'];
        
        // Atualizar no banco de dados
        $this->updateLocationInDatabase($userId, $location);
        
        // Enviar para interessados (empresa, passageiros em corrida)
        $this->broadcastToChannel("location_$userId", [
            'type' => 'location_updated',
            'user_id' => $userId,
            'location' => $location,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    private function handleRideUpdate(ConnectionInterface $conn, $data) {
        $rideId = $data['ride_id'];
        $status = $data['status'];
        
        // Notificar passageiro e motorista
        $this->broadcastToChannel("ride_$rideId", [
            'type' => 'ride_status_changed',
            'ride_id' => $rideId,
            'status' => $status,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    private function broadcastToChannel($channel, $message) {
        foreach ($this->clients as $client) {
            if (isset($client->channels[$channel])) {
                $client->send(json_encode($message));
            }
        }
    }

    private function verifyToken($token) {
        // Implementar verificação JWT
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) return false;
            
            $payload = json_decode(base64_decode($parts[1]), true);
            return $payload;
        } catch (Exception $e) {
            return false;
        }
    }

    private function updateLocationInDatabase($userId, $location) {
        // Atualizar localização no banco
        $pdo = Database::getInstance()->getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO localizacoes 
            (usuario_id, latitude, longitude, timestamp) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $location['lat'], $location['lng']]);
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        
        // Remover das conexões de usuário
        foreach ($this->userConnections as $userId => $userConn) {
            if ($userConn === $conn) {
                unset($this->userConnections[$userId]);
                break;
            }
        }
        
        echo "Conexão fechada: {$conn->resourceId}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Erro: {$e->getMessage()}\n";
        $conn->close();
    }
}

// Iniciar servidor WebSocket
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new KuvikaWebSocket()
        )
    ),
    8080
);

echo "Servidor WebSocket iniciado na porta 8080\n";
$server->run();