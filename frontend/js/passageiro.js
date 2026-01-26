// Passageiro Dashboard Functionality
class PassageiroApp {
    constructor() {
        this.userLocation = null;
        this.map = null;
        this.vehicles = [];
        this.currentRequest = null;
        this.driverInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTime();
        this.initMap();
        this.loadUserData();
        this.simulateVehicles();
        
        // Simular localização do usuário
        this.simulateUserLocation();
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
        
        // Localização atual
        document.getElementById('btnLocate').addEventListener('click', () => {
            this.centerMapOnUser();
        });
        
        // Botão usar localização atual
        document.getElementById('btnUseCurrent').addEventListener('click', () => {
            if (this.userLocation) {
                document.getElementById('originInput').value = 
                    `Minha localização (${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lng.toFixed(4)})`;
            }
        });
        
        // Contador de passageiros
        document.getElementById('btnIncPass').addEventListener('click', () => {
            const count = document.getElementById('passengerCount');
            let value = parseInt(count.textContent);
            if (value < 6) count.textContent = value + 1;
            this.calculatePrice();
        });
        
        document.getElementById('btnDecPass').addEventListener('click', () => {
            const count = document.getElementById('passengerCount');
            let value = parseInt(count.textContent);
            if (value > 1) count.textContent = value - 1;
            this.calculatePrice();
        });
        
        // Tipo de veículo
        document.querySelectorAll('.ride-type').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ride-type').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.calculatePrice();
            });
        });
        
        // Forma de pagamento
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', () => {
                console.log('Pagamento selecionado:', radio.value);
            });
        });
        
        // Solicitar corrida
        document.getElementById('btnRequestRide').addEventListener('click', () => {
            this.requestRide();
        });
        
        // Cancelar corrida
        document.getElementById('btnCancelRide').addEventListener('click', () => {
            this.cancelRide();
        });
        
        // Fechar modal
        document.querySelector('.btn-close').addEventListener('click', () => {
            document.getElementById('requestModal').style.display = 'none';
        });
        
        // Pesquisa de destino
        document.getElementById('destinationInput').addEventListener('input', (e) => {
            this.searchDestinations(e.target.value);
        });
        
        // Atualizar
        document.getElementById('btnRefresh').addEventListener('click', () => {
            this.refreshVehicles();
        });
    }
    
    initMap() {
        // Criar mapa focado em Luanda e Icolo e Bengo
        this.map = L.map('map').setView([-8.8383, 13.2344], 12);
        
        // Adicionar tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(this.map);
        
        // Limitar mapa às províncias de Luanda e Icolo e Bengo
        const bounds = L.latLngBounds(
            [-9.0, 12.5],  // sudoeste
            [-8.5, 13.8]   // nordeste
        );
        this.map.setMaxBounds(bounds);
        this.map.on('drag', () => {
            this.map.panInsideBounds(bounds, { animate: false });
        });
        
        // Adicionar marcador do usuário
        this.userMarker = L.marker([0, 0], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<i class="fas fa-user"></i>',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            })
        }).addTo(this.map);
        
        // Adicionar legenda
        this.addMapLegend();
    }
    
    addMapLegend() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <h4>Legenda</h4>
                <div class="legend-item">
                    <div class="legend-color" style="background: #2D5AA0"></div>
                    <span>Veículo Disponível</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #E53E3E"></div>
                    <span>Veículo Ocupado</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #0F9D58"></div>
                    <span>Seu Motorista</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #F6AD55"></div>
                    <span>Em Rota</span>
                </div>
            `;
            return div;
        };
        
        legend.addTo(this.map);
    }
    
    simulateUserLocation() {
        // Simular localização em Luanda
        const luandaPoints = [
            [-8.8383, 13.2344],  // Centro de Luanda
            [-8.8583, 13.2544],  // Marginal
            [-8.8183, 13.2144],  // Cazenga
            [-8.9083, 13.1844],  // Benfica
        ];
        
        let index = 0;
        this.userLocation = {
            lat: luandaPoints[0][0],
            lng: luandaPoints[0][1]
        };
        
        this.userMarker.setLatLng(this.userLocation);
        this.map.setView(this.userLocation, 13);
        
        // Atualizar status
        document.getElementById('locationStatus').textContent = 'Localizado em Luanda';
        document.getElementById('locationIcon').style.color = '#0F9D58';
        
        // Simular movimento
        setInterval(() => {
            index = (index + 1) % luandaPoints.length;
            this.userLocation = {
                lat: luandaPoints[index][0] + (Math.random() * 0.01 - 0.005),
                lng: luandaPoints[index][1] + (Math.random() * 0.01 - 0.005)
            };
            this.userMarker.setLatLng(this.userLocation);
        }, 10000);
    }
    
    centerMapOnUser() {
        if (this.userLocation) {
            this.map.setView(this.userLocation, 15);
            toastr.success('Mapa centralizado na sua localização');
        }
    }
    
    simulateVehicles() {
        // Coordenadas em Luanda e Icolo e Bengo
        const areas = [
            // Luanda
            { center: [-8.8383, 13.2344], radius: 0.05, count: 8 },
            { center: [-8.8583, 13.2544], radius: 0.03, count: 4 },
            { center: [-8.8183, 13.2144], radius: 0.04, count: 6 },
            // Icolo e Bengo
            { center: [-8.9, 13.35], radius: 0.08, count: 5 },
            { center: [-8.95, 13.4], radius: 0.06, count: 3 },
        ];
        
        this.vehicles = [];
        let vehicleId = 1;
        
        areas.forEach(area => {
            for (let i = 0; i < area.count; i++) {
                const lat = area.center[0] + (Math.random() * area.radius * 2 - area.radius);
                const lng = area.center[1] + (Math.random() * area.radius * 2 - area.radius);
                const status = Math.random() > 0.6 ? 'available' : 'busy';
                const type = ['taxi', 'van', 'bus'][Math.floor(Math.random() * 3)];
                
                const vehicle = {
                    id: vehicleId++,
                    lat,
                    lng,
                    status,
                    type,
                    plate: `LD-${Math.floor(Math.random() * 9000) + 1000}-${['LA', 'LD', 'LU'][Math.floor(Math.random() * 3)]}`,
                    driver: `Motorista ${vehicleId}`,
                    rating: (Math.random() * 2 + 3).toFixed(1)
                };
                
                this.vehicles.push(vehicle);
            }
        });
        
        this.renderVehicles();
        this.updateVehicleStats();
    }
    
    renderVehicles() {
        // Remover marcadores antigos
        if (this.vehicleMarkers) {
            this.vehicleMarkers.forEach(marker => this.map.removeLayer(marker));
        }
        
        this.vehicleMarkers = [];
        
        this.vehicles.forEach(vehicle => {
            const icon = L.divIcon({
                className: `vehicle-marker ${vehicle.status}`,
                html: `<i class="fas fa-${vehicle.type === 'taxi' ? 'taxi' : vehicle.type === 'van' ? 'van-shuttle' : 'bus'}"></i>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });
            
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
                .bindPopup(`
                    <div class="vehicle-popup">
                        <strong>${vehicle.type.toUpperCase()}</strong><br>
                        Matrícula: ${vehicle.plate}<br>
                        Status: ${vehicle.status === 'available' ? 'Disponível' : 'Ocupado'}<br>
                        Motorista: ${vehicle.driver}<br>
                        Avaliação: ${vehicle.rating} ⭐
                    </div>
                `)
                .addTo(this.map);
            
            this.vehicleMarkers.push(marker);
        });
    }
    
    updateVehicleStats() {
        const available = this.vehicles.filter(v => v.status === 'available').length;
        const nearby = this.vehicles.filter(v => {
            if (!this.userLocation) return false;
            const distance = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                v.lat, v.lng
            );
            return distance < 5; // Dentro de 5km
        }).length;
        
        document.getElementById('availableVehicles').textContent = available;
        document.getElementById('nearbyDrivers').textContent = nearby;
        document.getElementById('vehicleCount').textContent = `(${available} disponíveis)`;
        document.getElementById('avgWaitTime').textContent = Math.max(3, Math.floor(10 - available));
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    searchDestinations(query) {
        const suggestions = document.getElementById('destSuggestions');
        
        if (query.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        // Lugares em Luanda e Icolo e Bengo
        const places = [
            'Aeroporto 4 de Fevereiro, Luanda',
            'Marginal de Luanda',
            'Baía de Luanda',
            'Mausoleu de Agostinho Neto',
            'Museu Nacional de Antropologia',
            'Ilha de Luanda',
            'Hospital Josina Machel',
            'Mercado do Benfica',
            'Universidade Agostinho Neto',
            'Centro de Convenções de Talatona',
            'Cacuaco, Luanda',
            'Viana, Luanda',
            'Cazenga, Luanda',
            'Kilamba Kiaxi, Luanda',
            'Sambizanga, Luanda',
            'Icolo e Bengo - Sede',
            'Catete, Icolo e Bengo',
            'Bom Jesus, Icolo e Bengo'
        ];
        
        const filtered = places.filter(place => 
            place.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length > 0) {
            suggestions.innerHTML = filtered.map(place => `
                <div class="suggestion-item" data-place="${place}">
                    <i class="fas fa-map-marker-alt"></i> ${place}
                </div>
            `).join('');
            
            suggestions.style.display = 'block';
            
            // Adicionar eventos aos itens
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.getElementById('destinationInput').value = item.dataset.place;
                    suggestions.style.display = 'none';
                    this.calculatePrice();
                });
            });
        } else {
            suggestions.style.display = 'none';
        }
    }
    
    calculatePrice() {
        // Simulação de cálculo de preço
        const rideType = document.querySelector('.ride-type.active').dataset.type;
        const passengers = parseInt(document.getElementById('passengerCount').textContent);
        
        let basePrice = 0;
        switch(rideType) {
            case 'taxi': basePrice = 1500; break;
            case 'van': basePrice = 800; break;
            case 'bus': basePrice = 300; break;
        }
        
        const distance = 5 + Math.random() * 15; // 5-20km
        const time = distance * 3; // ~3 min/km
        
        const total = Math.round(basePrice * distance * (1 + (passengers - 1) * 0.2));
        
        document.getElementById('distanceEstimate').textContent = `${distance.toFixed(1)} km`;
        document.getElementById('timeEstimate').textContent = `${Math.round(time)} min`;
        document.getElementById('totalPrice').textContent = `${total.toFixed(2)} Kz`;
    }
    
    requestRide() {
        const destination = document.getElementById('destinationInput').value;
        
        if (!destination) {
            toastr.error('Por favor, informe o destino');
            return;
        }
        
        // Encontrar motorista disponível mais próximo
        const availableDrivers = this.vehicles.filter(v => v.status === 'available');
        
        if (availableDrivers.length === 0) {
            toastr.warning('Nenhum motorista disponível no momento. Tente novamente em alguns instantes.');
            return;
        }
        
        // Simular escolha do motorista mais próximo
        const driver = availableDrivers[0];
        driver.status = 'busy';
        
        this.currentRequest = {
            id: Date.now(),
            driver: driver,
            destination: destination,
            status: 'searching',
            eta: Math.floor(Math.random() * 10) + 5 // 5-15 minutos
        };
        
        // Atualizar interface
        document.getElementById('driverName').textContent = driver.driver;
        document.getElementById('driverDetails').textContent = `Taxi • ${driver.plate}`;
        document.getElementById('driverRating').textContent = driver.rating;
        document.getElementById('vehicleModel').textContent = driver.type === 'taxi' ? 'Taxi' : driver.type === 'van' ? 'Van' : 'Ônibus';
        document.getElementById('vehiclePlate').textContent = `Matrícula: ${driver.plate}`;
        document.getElementById('etaTime').textContent = `${this.currentRequest.eta} min`;
        
        // Atualizar badge
        document.getElementById('badgeViagem').textContent = '1';
        
        // Mostrar modal
        document.getElementById('requestModal').style.display = 'flex';
        
        // Simular aceitação
        setTimeout(() => {
            if (this.currentRequest) {
                this.currentRequest.status = 'accepted';
                document.getElementById('driverDetails').innerHTML = 
                    `Taxi • ${driver.plate} <span style="color: #0F9D58;">✓ Aceito</span>`;
                toastr.success('Motorista encontrado! ETA: ' + this.currentRequest.eta + ' minutos');
                
                // Atualizar veículo no mapa
                this.renderVehicles();
            }
        }, 3000);
        
        // Atualizar contagem
        this.updateVehicleStats();
    }
    
    cancelRide() {
        if (this.currentRequest) {
            // Liberar motorista
            const driver = this.vehicles.find(v => v.id === this.currentRequest.driver.id);
            if (driver) driver.status = 'available';
            
            // Limpar request
            this.currentRequest = null;
            
            // Atualizar interface
            document.getElementById('requestModal').style.display = 'none';
            document.getElementById('badgeViagem').textContent = '0';
            
            // Atualizar mapa
            this.renderVehicles();
            this.updateVehicleStats();
            
            toastr.info('Corrida cancelada');
        }
    }
    
    refreshVehicles() {
        // Atualizar status aleatoriamente
        this.vehicles.forEach(vehicle => {
            if (vehicle.status === 'available' && Math.random() > 0.7) {
                vehicle.status = 'busy';
            } else if (vehicle.status === 'busy' && Math.random() > 0.8) {
                vehicle.status = 'available';
            }
        });
        
        this.renderVehicles();
        this.updateVehicleStats();
        toastr.info('Veículos atualizados');
    }
    
    loadUserData() {
        // Simular dados do usuário
        const userData = {
            name: 'Carlos Silva',
            saldo: '5.000,00'
        };
        
        document.getElementById('userName').textContent = userData.name;
    }
    
    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-AO', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        document.getElementById('currentTime').textContent = timeStr;
        
        // Atualizar a cada minuto
        setTimeout(() => this.updateTime(), 60000);
    }
}

// Inicializar app quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.passageiroApp = new PassageiroApp();
    
    // Configurar Toastr
    toastr.options = {
        positionClass: 'toast-bottom-right',
        progressBar: true,
        timeOut: 3000
    };
});