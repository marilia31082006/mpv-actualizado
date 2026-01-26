class WebSocketClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.subscriptions = new Set();
        this.messageHandlers = {};
    }
    
    connect(token) {
        if (this.ws) {
            this.disconnect();
        }
        
        const wsUrl = 'ws://localhost:8080';
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket conectado');
            this.connected = true;
            this.reconnectAttempts = 0;
            
            // Autenticar
            this.send({
                type: 'auth',
                token: token
            });
            
            // Resubscribe aos canais
            this.subscriptions.forEach(channel => {
                this.subscribe(channel);
            });
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket desconectado');
            this.connected = false;
            this.attemptReconnect(token);
        };
        
        this.ws.onerror = (error) => {
            console.error('Erro WebSocket:', error);
        };
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
    
    attemptReconnect(token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            console.log(`Tentativa de reconexão ${this.reconnectAttempts} em ${delay}ms`);
            
            setTimeout(() => {
                this.connect(token);
            }, delay);
        }
    }
    
    send(data) {
        if (this.connected && this.ws) {
            this.ws.send(JSON.stringify(data));
        }
    }
    
    subscribe(channel) {
        this.subscriptions.add(channel);
        
        if (this.connected) {
            this.send({
                type: 'subscribe',
                channels: [channel]
            });
        }
    }
    
    unsubscribe(channel) {
        this.subscriptions.delete(channel);
    }
    
    on(event, handler) {
        if (!this.messageHandlers[event]) {
            this.messageHandlers[event] = [];
        }
        this.messageHandlers[event].push(handler);
    }
    
    off(event, handler) {
        if (this.messageHandlers[event]) {
            const index = this.messageHandlers[event].indexOf(handler);
            if (index > -1) {
                this.messageHandlers[event].splice(index, 1);
            }
        }
    }
    
    handleMessage(message) {
        // Handler para tipos específicos
        switch (message.type) {
            case 'auth_success':
                console.log('Autenticado no WebSocket');
                break;
                
            case 'ride_status_changed':
                this.notifyHandlers('ride_update', message);
                break;
                
            case 'location_updated':
                this.notifyHandlers('location_update', message);
                break;
                
            case 'new_message':
                this.notifyHandlers('new_message', message);
                break;
                
            case 'payment_confirmed':
                this.notifyHandlers('payment_confirmed', message);
                break;
        }
        
        // Handler genérico
        this.notifyHandlers('message', message);
    }
    
    notifyHandlers(event, data) {
        if (this.messageHandlers[event]) {
            this.messageHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Erro no handler de ${event}:`, error);
                }
            });
        }
    }
    
    // Métodos específicos para o app
    updateLocation(latitude, longitude) {
        this.send({
            type: 'location_update',
            location: {
                lat: latitude,
                lng: longitude
            }
        });
    }
    
    subscribeToRide(rideId) {
        this.subscribe(`ride_${rideId}`);
    }
    
    subscribeToUserLocation(userId) {
        this.subscribe(`location_${userId}`);
    }
}

// Exemplo de uso no frontend
/*
const wsClient = new WebSocketClient();

// Conectar com token JWT
wsClient.connect(localStorage.getItem('jwt_token'));

// Subscrever a uma corrida
wsClient.subscribeToRide(123);

// Escutar atualizações
wsClient.on('ride_update', (data) => {
    console.log('Status da corrida atualizado:', data);
    // Atualizar interface do usuário
    updateRideStatus(data.status);
});

wsClient.on('location_update', (data) => {
    console.log('Localização atualizada:', data);
    // Atualizar posição no mapa
    updateVehiclePosition(data.user_id, data.location);
});

// Atualizar localização do usuário
setInterval(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            wsClient.updateLocation(
                position.coords.latitude,
                position.coords.longitude
            );
        });
    }
}, 10000); // A cada 10 segundos
*/