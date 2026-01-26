// Motorista Dashboard Functionality
class MotoristaApp {
    constructor() {
        this.driverLocation = null;
        this.map = null;
        this.rideRequests = [];
        this.activeRide = null;
        this.rideTimer = null;
        this.rideTimerInterval = null;
        this.gpsActive = true;
        this.simulatedRides = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTime();
        this.initMap();
        this.loadDriverData();
        this.simulateRideRequests();
        this.startLocationSimulation();
        
        // Configurar Toastr
        toastr.options = {
            positionClass: 'toast-bottom-right',
            progressBar: true,
            timeOut: 3000
        };
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menuToggleDriver').addEventListener('click', () => {
            document.querySelector('.sidebar-motorista').classList.toggle('active');
        });
        
        // Status do veículo
        document.querySelectorAll('input[name="status"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateVehicleStatus(e.target.value);
            });
        });
        
        // Controles do mapa
        document.getElementById('btnCenterMap').addEventListener('click', () => {
            this.centerMapOnDriver();
        });
        
        document.getElementById('btnToggleTraffic').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            toastr.info('Trânsito: ' + (e.target.classList.contains('active') ? 'Ativado' : 'Desativado'));
        });
        
        // GPS toggle
        document.getElementById('btnToggleGPS').addEventListener('click', () => {
            this.toggleGPS();
        });
        
        // Filtro de corridas
        document.getElementById('ridesFilter').addEventListener('change', (e) => {
            this.filterRides(e.target.value);
        });
        
        // Modal de corrida
        document.getElementById('btnRejectRide').addEventListener('click', () => {
            this.rejectRide();
        });
        
        document.getElementById('btnAcceptRide').addEventListener('click', () => {
            this.acceptRide();
        });
        
        // Ações da corrida ativa
        document.getElementById('btnStartRide').addEventListener('click', () => {
            this.startRide();
        });
        
        document.getElementById('btnCompleteRide').addEventListener('click', () => {
            this.completeRide();
        });
        
        document.getElementById('btnCallPassenger').addEventListener('click', () => {
            this.callPassenger();
        });
    }
    
    initMap() {
        // Criar mapa focado em Luanda
        this.map = L.map('driverMap').setView([-8.8383, 13.2344], 13);
        
        // Adicionar tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(this.map);
        
        // Limitar mapa
        const bounds = L.latLngBounds(
            [-9.0, 12.5],
            [-8.5, 13.8]
        );
        this.map.setMaxBounds(bounds);
        
        // Marcador do motorista
        this.driverMarker = L.marker([0, 0], {
            icon: L.divIcon({
                className: 'driver-marker',
                html: '<i class="fas fa-car"></i>',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            })
        }).addTo(this.map);
        
        // Marcador do passageiro (se houver)
        this.passengerMarker = L.marker([0, 0], {
            icon: L.divIcon({
                className: 'passenger-marker',
                html: '<i class="fas fa-user"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(this.map);
        this.passengerMarker.setOpacity(0);
        
        // Rota
        this.routeLine = L.polyline([], {
            color: '#2D5AA0',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(this.map);
    }
    
    startLocationSimulation() {
        // Pontos em Luanda para simulação
        const luandaRoute = [
            [-8.8383, 13.2344],  // Centro
            [-8.8483, 13.2444],  // Marginal
            [-8.8583, 13.2544],  // Baía
            [-8.8683, 13.2644],  // Ilha
            [-8.8783, 13.2444],  // Benfica
            [-8.8883, 13.2344],  // Viana
        ];
        
        let routeIndex = 0;
        let direction = 1;
        
        const updateLocation = () => {
            if (!this.gpsActive) return;
            
            // Mover ao longo da rota
            const nextIndex = routeIndex + direction;
            
            if (nextIndex >= luandaRoute.length || nextIndex < 0) {
                direction *= -1;
                routeIndex += direction;
            } else {
                routeIndex = nextIndex;
            }
            
            const [lat, lng] = luandaRoute[routeIndex];
            this.driverLocation = { lat, lng };
            
            // Adicionar pequena variação
            this.driverLocation.lat += (Math.random() * 0.002 - 0.001);
            this.driverLocation.lng += (Math.random() * 0.002 - 0.001);
            
            // Atualizar marcador
            this.driverMarker.setLatLng(this.driverLocation);
            
            // Atualizar informações
            this.updateLocationInfo();
            
            // Simular velocidade
            const speed = 30 + Math.random() * 40; // 30-70 km/h
            document.getElementById('currentSpeed').textContent = `${Math.round(speed)} km/h`;
            
            // Se houver corrida ativa, atualizar rota
            if (this.activeRide) {
                this.updateActiveRideRoute();
            }
        };
        
        // Inicializar
        updateLocation();
        
        // Atualizar a cada 3 segundos
        setInterval(updateLocation, 3000);
    }
    
    updateLocationInfo() {
        if (!this.driverLocation) return;
        
        // Atualizar texto da localização
        const locations = [
            'Centro de Luanda',
            'Marginal de Luanda',
            'Baía de Luanda',
            'Ilha de Luanda',
            'Benfica, Luanda',
            'Viana, Luanda',
            'Cazenga, Luanda',
            'Kilamba Kiaxi, Luanda'
        ];
        
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        document.getElementById('currentLocation').textContent = randomLocation;
        document.getElementById('locationInfo').textContent = randomLocation + ', Angola';
        
        // Centralizar mapa se necessário
        if (this.map.getZoom() < 13) {
            this.map.setView(this.driverLocation, 13);
        }
    }
    
    centerMapOnDriver() {
        if (this.driverLocation) {
            this.map.setView(this.driverLocation, 15);
            toastr.success('Mapa centralizado na sua localização');
        }
    }
    
    toggleGPS() {
        this.gpsActive = !this.gpsActive;
        const statusElement = document.getElementById('gpsStatus');
        const button = document.getElementById('btnToggleGPS');
        
        if (this.gpsActive) {
            statusElement.textContent = 'Ativo';
            button.style.background = '#F0FFF4';
            button.style.borderColor = '#C6F6D5';
            button.style.color = '#22543D';
            toastr.success('GPS ativado');
        } else {
            statusElement.textContent = 'Inativo';
            button.style.background = '#FED7D7';
            button.style.borderColor = '#FC8181';
            button.style.color = '#C53030';
            toastr.warning('GPS desativado');
        }
    }
    
    updateVehicleStatus(status) {
        const statusMap = {
            'livre': 'Livre',
            'cheio': 'Cheio',
            'em_rota': 'Em Rota',
            'avariado': 'Avariado'
        };
        
        toastr.info(`Status alterado para: ${statusMap[status]}`);
        
        // Atualizar badge se estiver em rota
        const ridesBadge = document.getElementById('ridesBadge');
        if (status === 'em_rota' && this.activeRide) {
            ridesBadge.textContent = '1';
        } else {
            ridesBadge.textContent = this.rideRequests.length;
        }
    }
    
    simulateRideRequests() {
        // Gerar corridas simuladas
        const passengers = [
            { name: 'Maria Santos', rating: 4.9, trips: 42 },
            { name: 'Carlos Mendes', rating: 4.7, trips: 18 },
            { name: 'Ana Pereira', rating: 5.0, trips: 31 },
            { name: 'João Silva', rating: 4.5, trips: 7 },
            { name: 'Luísa Costa', rating: 4.8, trips: 56 }
        ];
        
        const startPoints = [
            'Avenida 4 de Fevereiro, Luanda',
            'Marginal de Luanda',
            'Hospital Josina Machel',
            'Mercado do Benfica',
            'Universidade Agostinho Neto'
        ];
        
        const endPoints = [
            'Aeroporto 4 de Fevereiro',
            'Centro de Convenções de Talatona',
            'Ilha de Luanda',
            'Cazenga, Luanda',
            'Viana, Luanda'
        ];
        
        for (let i = 0; i < 5; i++) {
            const passenger = passengers[Math.floor(Math.random() * passengers.length)];
            const distance = (Math.random() * 5 + 1).toFixed(1);
            const price = Math.round(500 + Math.random() * 3000);
            
            this.rideRequests.push({
                id: i + 1,
                passenger: passenger.name,
                rating: passenger.rating,
                trips: passenger.trips,
                start: startPoints[Math.floor(Math.random() * startPoints.length)],
                end: endPoints[Math.floor(Math.random() * endPoints.length)],
                distance: distance + ' km',
                passengers: Math.floor(Math.random() * 3) + 1,
                baggage: ['Nenhuma', 'Pequena', 'Média', 'Grande'][Math.floor(Math.random() * 4)],
                payment: ['Dinheiro', 'Cartão', 'KUVIKA Wallet'][Math.floor(Math.random() * 3)],
                price: price + ' Kz',
                timestamp: Date.now() - Math.random() * 300000 // Últimos 5 minutos
            });
        }
        
        this.renderRideRequests();
        
        // Simular nova corrida a cada 1-2 minutos
        setTimeout(() => {
            this.simulateNewRideRequest();
        }, Math.random() * 60000 + 60000);
    }
    
    renderRideRequests() {
        const ridesList = document.getElementById('ridesList');
        
        if (this.rideRequests.length === 0) {
            ridesList.innerHTML = `
                <div class="no-rides">
                    <i class="fas fa-car"></i>
                    <p>Nenhuma corrida disponível no momento</p>
                </div>
            `;
            return;
        }
        
        ridesList.innerHTML = this.rideRequests.map(ride => `
            <div class="ride-card" data-ride-id="${ride.id}">
                <div class="ride-card-header">
                    <div class="ride-passenger">
                        <div class="passenger-avatar-sm">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <h5>${ride.passenger}</h5>
                            <p class="passenger-rating-sm">
                                <i class="fas fa-star"></i> ${ride.rating} • ${ride.trips} viagens
                            </p>
                        </div>
                    </div>
                    <div class="ride-distance">
                        <i class="fas fa-location-arrow"></i>
                        <span>${ride.distance}</span>
                    </div>
                </div>
                <div class="ride-route-sm">
                    <div class="route-point-sm">
                        <div class="point-marker-sm start"></div>
                        <div class="point-address-sm">${ride.start}</div>
                    </div>
                    <div class="route-point-sm">
                        <div class="point-marker-sm end"></div>
                        <div class="point-address-sm">${ride.end}</div>
                    </div>
                </div>
                <div class="ride-details">
                    <div class="detail-item-sm">
                        <i class="fas fa-users"></i>
                        <span>${ride.passengers} passageiro${ride.passengers > 1 ? 's' : ''}</span>
                    </div>
                    <div class="detail-item-sm">
                        <i class="fas fa-suitcase"></i>
                        <span>${ride.baggage}</span>
                    </div>
                    <div class="detail-item-sm">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>${ride.payment}</span>
                    </div>
                </div>
                <div class="ride-price">
                    <span class="price-value-sm">${ride.price}</span>
                    <button class="btn-accept-sm" onclick="motoristaApp.showRideRequestModal(${ride.id})">
                        Aceitar
                    </button>
                </div>
            </div>
        `).join('');
        
        // Atualizar badge
        document.getElementById('ridesBadge').textContent = this.rideRequests.length;
    }
    
    simulateNewRideRequest() {
        const newRide = {
            id: this.rideRequests.length + 1,
            passenger: ['Pedro Alves', 'Sofia Lima', 'Miguel Santos'][Math.floor(Math.random() * 3)],
            rating: (Math.random() * 0.5 + 4.5).toFixed(1),
            trips: Math.floor(Math.random() * 50) + 1,
            start: ['Avenida Brasil, Luanda', 'Rua da Missão, Luanda', 'Largo do Kinaxixi'][Math.floor(Math.random() * 3)],
            end: ['Mausoléu Agostinho Neto', 'Museu da Moeda', 'Fortaleza de São Miguel'][Math.floor(Math.random() * 3)],
            distance: (Math.random() * 4 + 0.5).toFixed(1) + ' km',
            passengers: Math.floor(Math.random() * 3) + 1,
            baggage: ['Nenhuma', 'Pequena'][Math.floor(Math.random() * 2)],
            payment: ['Dinheiro', 'Cartão'][Math.floor(Math.random() * 2)],
            price: Math.round(800 + Math.random() * 2500) + ' Kz',
            timestamp: Date.now()
        };
        
        this.rideRequests.unshift(newRide);
        this.renderRideRequests();
        
        // Mostrar notificação
        toastr.info(`Nova corrida disponível de ${newRide.passenger}`, 'Nova Solicitação!', {
            timeOut: 10000,
            extendedTimeOut: 5000,
            closeButton: true
        });
        
        // Agendar próxima corrida
        setTimeout(() => {
            this.simulateNewRideRequest();
        }, Math.random() * 120000 + 60000); // 1-3 minutos
    }
    
    showRideRequestModal(rideId) {
        const ride = this.rideRequests.find(r => r.id === rideId);
        if (!ride) return;
        
        // Preencher modal
        document.getElementById('requestPassenger').textContent = ride.passenger;
        document.getElementById('requestRating').textContent = ride.rating;
        document.getElementById('requestDistance').textContent = ride.distance;
        document.getElementById('requestPickup').textContent = ride.start;
        document.getElementById('requestDropoff').textContent = ride.end;
        document.getElementById('requestPassengers').textContent = 
            `${ride.passengers} passageiro${ride.passengers > 1 ? 's' : ''}`;
        document.getElementById('requestBaggage').textContent = ride.baggage;
        document.getElementById('requestPayment').textContent = ride.payment;
        document.getElementById('requestPrice').textContent = ride.price;
        
        // Timer de 30 segundos
        let timeLeft = 30;
        const timerElement = document.getElementById('requestTimer');
        timerElement.textContent = timeLeft;
        
        const timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                this.rejectRide(rideId);
            }
        }, 1000);
        
        // Armazenar referências
        this.currentModalRideId = rideId;
        this.currentModalTimer = timerInterval;
        
        // Mostrar modal
        document.getElementById('rideRequestModal').style.display = 'flex';
    }
    
    acceptRide() {
        if (!this.currentModalRideId) return;
        
        const rideIndex = this.rideRequests.findIndex(r => r.id === this.currentModalRideId);
        if (rideIndex === -1) return;
        
        const ride = this.rideRequests[rideIndex];
        
        // Remover da lista de solicitações
        this.rideRequests.splice(rideIndex, 1);
        this.renderRideRequests();
        
        // Fechar modal
        this.closeRideModal();
        
        // Iniciar corrida ativa
        this.startActiveRide(ride);
        
        toastr.success(`Corrida aceita! Dirija-se até ${ride.start}`);
    }
    
    rejectRide() {
        if (!this.currentModalRideId) return;
        
        const rideIndex = this.rideRequests.findIndex(r => r.id === this.currentModalRideId);
        if (rideIndex === -1) return;
        
        // Remover da lista
        this.rideRequests.splice(rideIndex, 1);
        this.renderRideRequests();
        
        this.closeRideModal();
        toastr.info('Corrida recusada');
    }
    
    closeRideModal() {
        clearInterval(this.currentModalTimer);
        document.getElementById('rideRequestModal').style.display = 'none';
        this.currentModalRideId = null;
        this.currentModalTimer = null;
    }
    
    startActiveRide(ride) {
        this.activeRide = {
            ...ride,
            startTime: Date.now(),
            status: 'waiting',
            timer: 0
        };
        
        // Atualizar interface
        document.getElementById('passengerName').textContent = ride.passenger;
        document.getElementById('startAddress').textContent = ride.start;
        document.getElementById('endAddress').textContent = ride.end;
        document.getElementById('rideValue').textContent = ride.price;
        document.getElementById('paymentMethod').textContent = ride.payment;
        
        // Mostrar card de corrida ativa
        document.getElementById('activeRideCard').style.display = 'block';
        
        // Iniciar timer
        this.startRideTimer();
        
        // Atualizar status do veículo
        document.querySelector('input[name="status"][value="em_rota"]').checked = true;
        this.updateVehicleStatus('em_rota');
        
        // Atualizar mapa
        this.updateMapForActiveRide();
    }
    
    updateMapForActiveRide() {
        if (!this.activeRide || !this.driverLocation) return;
        
        // Simular localização do passageiro (1-2km de distância)
        const passengerLat = this.driverLocation.lat + (Math.random() * 0.02 - 0.01);
        const passengerLng = this.driverLocation.lng + (Math.random() * 0.02 - 0.01);
        
        // Mostrar marcador do passageiro
        this.passengerMarker.setLatLng([passengerLat, passengerLng]);
        this.passengerMarker.setOpacity(1);
        
        // Desenhar rota
        this.routeLine.setLatLngs([
            [passengerLat, passengerLng],
            [this.driverLocation.lat, this.driverLocation.lng]
        ]);
        
        // Ajustar zoom para mostrar ambos
        const bounds = L.latLngBounds([
            [passengerLat, passengerLng],
            [this.driverLocation.lat, this.driverLocation.lng]
        ]);
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    updateActiveRideRoute() {
        if (!this.activeRide || this.activeRide.status !== 'in_progress') return;
        
        // Atualizar rota no mapa (simulação)
        const currentLatLng = this.driverMarker.getLatLng();
        const routePoints = this.routeLine.getLatLngs();
        
        if (routePoints.length > 0) {
            // Mover último ponto em direção ao destino
            const lastPoint = routePoints[routePoints.length - 1];
            const deltaLat = (currentLatLng.lat - lastPoint.lat) * 0.1;
            const deltaLng = (currentLatLng.lng - lastPoint.lng) * 0.1;
            
            routePoints.push([
                lastPoint.lat + deltaLat,
                lastPoint.lng + deltaLng
            ]);
            
            // Manter apenas últimos 50 pontos
            if (routePoints.length > 50) {
                routePoints.shift();
            }
            
            this.routeLine.setLatLngs(routePoints);
        }
    }
    
    startRideTimer() {
        let seconds = 0;
        
        this.rideTimerInterval = setInterval(() => {
            seconds++;
            this.activeRide.timer = seconds;
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            document.getElementById('rideTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    startRide() {
        if (!this.activeRide) return;
        
        this.activeRide.status = 'in_progress';
        document.getElementById('btnStartRide').style.display = 'none';
        
        toastr.success('Viagem iniciada! Boa viagem!');
    }
    
    completeRide() {
        if (!this.activeRide) return;
        
        // Parar timer
        clearInterval(this.rideTimerInterval);
        
        // Calcular ganhos
        const price = parseFloat(this.activeRide.price.split(' ')[0]);
        const earningsToday = parseInt(document.getElementById('todayEarnings').textContent.replace('.', ''));
        const ridesToday = parseInt(document.getElementById('todayRides').textContent);
        
        document.getElementById('todayEarnings').textContent = (earningsToday + price).toLocaleString('pt-AO');
        document.getElementById('todayRides').textContent = ridesToday + 1;
        
        // Adicionar ao histórico
        this.simulatedRides.unshift({
            time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
            route: `${this.activeRide.start.split(',')[0]} → ${this.activeRide.end.split(',')[0]}`,
            value: this.activeRide.price
        });
        
        // Limpar corrida ativa
        this.activeRide = null;
        
        // Limpar interface
        document.getElementById('activeRideCard').style.display = 'none';
        this.passengerMarker.setOpacity(0);
        this.routeLine.setLatLngs([]);
        
        // Resetar status do veículo
        document.querySelector('input[name="status"][value="livre"]').checked = true;
        this.updateVehicleStatus('livre');
        
        toastr.success('Corrida finalizada com sucesso!');
    }
    
    callPassenger() {
        toastr.info('Chamando passageiro...');
        // Simulação - em produção, integraria com API de chamadas
    }
    
    filterRides(filter) {
        // Implementar filtragem real
        toastr.info(`Filtro aplicado: ${filter}`);
    }
    
    loadDriverData() {
        // Simular dados do motorista
        const driverData = {
            name: 'João Fernandes',
            plate: 'LD-2541-LA',
            model: 'Toyota Hiace',
            capacity: '15 passageiros',
            company: 'Transangol',
            todayRides: 8,
            todayEarnings: '25400',
            todayHours: '6.5',
            todayRating: '4.9'
        };
        
        document.getElementById('driverName').textContent = driverData.name;
        document.getElementById('vehiclePlate').textContent = driverData.plate;
        document.getElementById('vehicleModel').textContent = driverData.model;
        document.getElementById('vehicleCapacity').textContent = driverData.capacity;
        document.getElementById('vehicleCompany').textContent = driverData.company;
        document.getElementById('todayRides').textContent = driverData.todayRides;
        document.getElementById('todayEarnings').textContent = driverData.todayEarnings;
        document.getElementById('todayHours').textContent = driverData.todayHours;
        document.getElementById('todayRating').textContent = driverData.todayRating;
    }
    
    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-AO', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        document.getElementById('driverTime').textContent = timeStr;
        
        // Atualizar a cada minuto
        setTimeout(() => this.updateTime(), 60000);
    }
}

// Inicializar app quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.motoristaApp = new MotoristaApp();
});