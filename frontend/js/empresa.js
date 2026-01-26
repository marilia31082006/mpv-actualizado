// Empresa Dashboard Functionality
class EmpresaApp {
    constructor() {
        this.map = null;
        this.vehicles = [];
        this.markers = [];
        this.vehicleData = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initMap();
        this.loadCompanyData();
        this.simulateFleetData();
        this.updateDashboard();
        
        // Configurar Toastr
        toastr.options = {
            positionClass: 'toast-top-right',
            progressBar: true,
            timeOut: 3000
        };
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menuToggleEmpresa').addEventListener('click', () => {
            document.querySelector('.sidebar-empresa').classList.toggle('active');
        });
        
        // Botões de ação
        document.getElementById('btnRefreshDashboard').addEventListener('click', () => {
            this.refreshDashboard();
        });
        
        document.getElementById('btnAddNew').addEventListener('click', () => {
            this.showAddNewOptions();
        });
        
        // Filtro do mapa
        document.getElementById('mapFilter').addEventListener('change', (e) => {
            this.filterMapVehicles(e.target.value);
        });
        
        // Controle do mapa
        document.getElementById('btnZoomAll').addEventListener('click', () => {
            this.zoomToAllVehicles();
        });
        
        // Nova mensagem
        document.getElementById('btnNewMessage').addEventListener('click', () => {
            this.showNewMessageModal();
        });
        
        // Fechar modal
        document.querySelector('.btn-close-empresa').addEventListener('click', () => {
            this.closeMessageModal();
        });
        
        // Cancelar mensagem
        document.querySelector('.btn-cancel-empresa').addEventListener('click', () => {
            this.closeMessageModal();
        });
        
        // Enviar mensagem
        document.querySelector('.btn-send-empresa').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Filtro de tempo
        document.getElementById('timeFilter').addEventListener('change', (e) => {
            this.updateTimeFilter(e.target.value);
        });
    }
    
    initMap() {
        // Criar mapa focado em Luanda
        this.map = L.map('empresaMap').setView([-8.8383, 13.2344], 12);
        
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
    }
    
    loadCompanyData() {
        // Simular dados da empresa
        const companyData = {
            name: 'Transangol Ltda',
            frotaTotal: 30,
            frotaAtiva: 24,
            motoristas: 28,
            rotas: 12,
            passageirosHoje: 1254,
            receitaHoje: 245780
        };
        
        document.getElementById('empresaNome').textContent = companyData.name;
        document.getElementById('frotaAtiva').textContent = `${companyData.frotaAtiva}/${companyData.frotaTotal}`;
        document.getElementById('frotaBadge').textContent = companyData.frotaTotal;
        document.getElementById('motoristasBadge').textContent = companyData.motoristas;
        document.getElementById('rotasBadge').textContent = companyData.rotas;
        document.getElementById('totalVeiculos').textContent = companyData.frotaTotal;
        document.getElementById('totalRotas').textContent = companyData.rotas;
        document.getElementById('totalPassageiros').textContent = companyData.passageirosHoje.toLocaleString('pt-AO');
        document.getElementById('receitaHoje').textContent = companyData.receitaHoje.toLocaleString('pt-AO');
    }
    
    simulateFleetData() {
        // Gerar dados simulados da frota
        this.vehicleData = [];
        const statuses = ['livre', 'em_rota', 'cheio', 'avariado'];
        const statusColors = {
            'livre': '#52C41A',
            'em_rota': '#1890FF',
            'cheio': '#FA8C16',
            'avariado': '#F5222D'
        };
        const statusIcons = {
            'livre': 'fa-check-circle',
            'em_rota': 'fa-road',
            'cheio': 'fa-users',
            'avariado': 'fa-tools'
        };
        
        // Coordenadas em Luanda e Icolo e Bengo
        const luandaArea = [
            [-8.8383, 13.2344], // Centro
            [-8.8583, 13.2544], // Marginal
            [-8.8183, 13.2144], // Cazenga
            [-8.9083, 13.1844], // Benfica
            [-8.8883, 13.2344], // Viana
            [-8.9500, 13.3500], // Icolo e Bengo
            [-8.9200, 13.4000], // Catete
            [-8.8700, 13.2800], // Talatona
        ];
        
        for (let i = 1; i <= 24; i++) {
            const area = luandaArea[Math.floor(Math.random() * luandaArea.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const lat = area[0] + (Math.random() * 0.03 - 0.015);
            const lng = area[1] + (Math.random() * 0.03 - 0.015);
            
            this.vehicleData.push({
                id: i,
                plate: `LD-${1000 + i}-${['LA', 'LD', 'LU'][Math.floor(Math.random() * 3)]}`,
                model: ['Toyota Hiace', 'Mercedes Sprinter', 'Coaster', 'Van'][Math.floor(Math.random() * 4)],
                status: status,
                color: statusColors[status],
                icon: statusIcons[status],
                lat: lat,
                lng: lng,
                driver: `Motorista ${Math.floor(Math.random() * 28) + 1}`,
                route: `Linha ${Math.floor(Math.random() * 12) + 1}`,
                passengers: status === 'cheio' ? 15 : Math.floor(Math.random() * 15),
                capacity: 15,
                lastUpdate: new Date(Date.now() - Math.random() * 3600000) // Última hora
            });
        }
        
        this.renderVehiclesOnMap();
    }
    
    renderVehiclesOnMap() {
        // Limpar marcadores antigos
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // Adicionar novos marcadores
        this.vehicleData.forEach(vehicle => {
            const icon = L.divIcon({
                className: 'vehicle-marker-empresa',
                html: `
                    <div style="
                        background: ${vehicle.color};
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                    ">
                        <i class="fas ${vehicle.icon}"></i>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
                .bindPopup(`
                    <div class="vehicle-popup-empresa">
                        <strong>${vehicle.plate}</strong><br>
                        Modelo: ${vehicle.model}<br>
                        Status: ${this.getStatusText(vehicle.status)}<br>
                        Motorista: ${vehicle.driver}<br>
                        Rota: ${vehicle.route}<br>
                        Passageiros: ${vehicle.passengers}/${vehicle.capacity}<br>
                        Última atualização: ${vehicle.lastUpdate.toLocaleTimeString('pt-AO', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                `)
                .addTo(this.map);
            
            this.markers.push(marker);
        });
        
        // Atualizar distribuição de status
        this.updateStatusDistribution();
    }
    
    getStatusText(status) {
        const statusMap = {
            'livre': 'Disponível',
            'em_rota': 'Em Rota',
            'cheio': 'Cheio',
            'avariado': 'Avariado'
        };
        return statusMap[status] || status;
    }
    
    updateStatusDistribution() {
        const counts = {
            livre: this.vehicleData.filter(v => v.status === 'livre').length,
            em_rota: this.vehicleData.filter(v => v.status === 'em_rota').length,
            cheio: this.vehicleData.filter(v => v.status === 'cheio').length,
            avariado: this.vehicleData.filter(v => v.status === 'avariado').length
        };
        
        // Atualizar contagens
        document.querySelectorAll('.distribution-count').forEach((element, index) => {
            const status = ['livre', 'em_rota', 'cheio', 'avariado'][index];
            element.textContent = counts[status] || 0;
        });
        
        // Atualizar barras
        const maxCount = Math.max(...Object.values(counts));
        document.querySelectorAll('.distribution-bar').forEach((bar, index) => {
            const status = ['livre', 'em_rota', 'cheio', 'avariado'][index];
            const count = counts[status] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            bar.style.height = `${percentage}%`;
        });
        
        // Atualizar atividade da frota
        const activeVehicles = this.vehicleData.filter(v => v.status !== 'avariado').length;
        const activityPercentage = Math.round((activeVehicles / this.vehicleData.length) * 100);
        
        const progressBar = document.querySelector('.progress-bar');
        const percentageElement = document.querySelector('.metric-percentage');
        
        progressBar.style.width = `${activityPercentage}%`;
        percentageElement.textContent = `${activityPercentage}%`;
    }
    
    filterMapVehicles(filter) {
        this.markers.forEach((marker, index) => {
            const vehicle = this.vehicleData[index];
            
            if (filter === 'all' || vehicle.status === filter) {
                marker.setOpacity(1);
            } else {
                marker.setOpacity(0.3);
            }
        });
        
        toastr.info(`Filtro aplicado: ${this.getFilterText(filter)}`);
    }
    
    getFilterText(filter) {
        const filterMap = {
            'all': 'Todos os Veículos',
            'livre': 'Apenas Disponíveis',
            'em_rota': 'Em Rota',
            'cheio': 'Cheios'
        };
        return filterMap[filter] || filter;
    }
    
    zoomToAllVehicles() {
        if (this.vehicleData.length === 0) return;
        
        const bounds = L.latLngBounds(
            this.vehicleData.map(v => [v.lat, v.lng])
        );
        
        this.map.fitBounds(bounds, { padding: [50, 50] });
        toastr.success('Mapa ajustado para mostrar todos os veículos');
    }
    
    refreshDashboard() {
        // Simular atualização de dados
        this.vehicleData.forEach(vehicle => {
            // Simular mudança de status
            if (Math.random() > 0.7) {
                const statuses = ['livre', 'em_rota', 'cheio', 'avariado'];
                const currentIndex = statuses.indexOf(vehicle.status);
                const newIndex = (currentIndex + 1) % statuses.length;
                vehicle.status = statuses[newIndex];
                
                // Atualizar cores e ícones
                const statusColors = {
                    'livre': '#52C41A',
                    'em_rota': '#1890FF',
                    'cheio': '#FA8C16',
                    'avariado': '#F5222D'
                };
                const statusIcons = {
                    'livre': 'fa-check-circle',
                    'em_rota': 'fa-road',
                    'cheio': 'fa-users',
                    'avariado': 'fa-tools'
                };
                
                vehicle.color = statusColors[vehicle.status];
                vehicle.icon = statusIcons[vehicle.status];
                
                // Atualizar passageiros
                if (vehicle.status === 'cheio') {
                    vehicle.passengers = vehicle.capacity;
                } else if (vehicle.status === 'livre') {
                    vehicle.passengers = 0;
                } else {
                    vehicle.passengers = Math.floor(Math.random() * vehicle.capacity);
                }
            }
            
            // Atualizar última atualização
            vehicle.lastUpdate = new Date();
        });
        
        this.renderVehiclesOnMap();
        
        // Atualizar estatísticas rápidas
        const passageirosHoje = 1254 + Math.floor(Math.random() * 100);
        const receitaHoje = 245780 + Math.floor(Math.random() * 5000);
        
        document.getElementById('totalPassageiros').textContent = passageirosHoje.toLocaleString('pt-AO');
        document.getElementById('receitaHoje').textContent = receitaHoje.toLocaleString('pt-AO');
        
        toastr.success('Dashboard atualizado com sucesso!');
    }
    
    showAddNewOptions() {
        // Simulação - em produção abriria um menu
        toastr.info('Adicionar novo: Veículo | Motorista | Rota', 'Opções', {
            timeOut: 5000,
            closeButton: true
        });
    }
    
    showNewMessageModal() {
        document.getElementById('messageModal').style.display = 'flex';
    }
    
    closeMessageModal() {
        document.getElementById('messageModal').style.display = 'none';
        // Limpar formulário
        document.getElementById('messageSubject').value = '';
        document.getElementById('messageContent').value = '';
    }
    
    sendMessage() {
        const subject = document.getElementById('messageSubject').value;
        const content = document.getElementById('messageContent').value;
        const recipients = document.getElementById('messageRecipients').value;
        const messageType = document.querySelector('input[name="messageType"]:checked').value;
        
        if (!subject || !content) {
            toastr.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        // Simular envio
        console.log('Mensagem enviada:', {
            subject,
            content,
            recipients,
            messageType,
            timestamp: new Date()
        });
        
        this.closeMessageModal();
        
        // Adicionar à lista de mensagens
        this.addMessageToList(subject, content, recipients);
        
        toastr.success('Mensagem enviada aos motoristas!');
    }
    
    addMessageToList(subject, content, recipients) {
        const messagesList = document.querySelector('.messages-list');
        const recipientText = recipients.includes('all') ? 'Todos os motoristas' : 'Motoristas selecionados';
        
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item unread';
        messageItem.innerHTML = `
            <div class="message-header">
                <h5>${subject}</h5>
                <span class="message-time">Agora</span>
            </div>
            <p class="message-preview">${content.substring(0, 60)}${content.length > 60 ? '...' : ''}</p>
            <div class="message-recipients">
                <span class="recipient-count">Enviado para ${recipientText}</span>
            </div>
        `;
        
        messagesList.insertBefore(messageItem, messagesList.firstChild);
        
        // Atualizar contador de notificações
        const notificationCount = document.querySelector('.notification-count-empresa');
        notificationCount.textContent = parseInt(notificationCount.textContent) + 1;
    }
    
    updateTimeFilter(period) {
        const periodMap = {
            'today': 'Hoje',
            'week': 'Esta Semana',
            'month': 'Este Mês'
        };
        
        toastr.info(`Período alterado para: ${periodMap[period]}`);
        
        // Simular atualização de dados baseado no período
        // Em produção, buscaria dados diferentes da API
    }
    
    updateDashboard() {
        // Simular atualizações em tempo real
        setInterval(() => {
            // Atualizar alguns veículos aleatoriamente
            this.vehicleData.forEach(vehicle => {
                if (Math.random() > 0.8) { // 20% de chance de atualizar
                    // Mover veículo levemente
                    vehicle.lat += (Math.random() * 0.001 - 0.0005);
                    vehicle.lng += (Math.random() * 0.001 - 0.0005);
                    
                    // Atualizar marcador
                    const marker = this.markers[vehicle.id - 1];
                    if (marker) {
                        marker.setLatLng([vehicle.lat, vehicle.lng]);
                    }
                }
            });
            
            // Atualizar última atividade aleatoriamente
            const activityItems = document.querySelectorAll('.activity-item');
            if (activityItems.length > 0 && Math.random() > 0.7) {
                const activities = [
                    'Novo passageiro registado no sistema',
                    'Veículo chegou ao destino',
                    'Pagamento processado via cartão',
                    'Motorista iniciou nova rota',
                    'Veículo reportou problema'
                ];
                
                const newActivity = activities[Math.floor(Math.random() * activities.length)];
                const time = new Date().toLocaleTimeString('pt-AO', {hour: '2-digit', minute:'2-digit'});
                
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-time">${time}</div>
                    <div class="activity-content">
                        <p><strong>${newActivity}</strong></p>
                        <span class="activity-detail">Atualizado agora</span>
                    </div>
                `;
                
                const timeline = document.querySelector('.activity-timeline');
                timeline.insertBefore(activityItem, timeline.firstChild);
                
                // Manter apenas últimos 5 itens
                if (activityItems.length >= 5) {
                    timeline.removeChild(timeline.lastChild);
                }
            }
        }, 10000); // Atualizar a cada 10 segundos
    }
}

// Inicializar app quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.empresaApp = new EmpresaApp();
});