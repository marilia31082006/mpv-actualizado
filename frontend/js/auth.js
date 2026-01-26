document.addEventListener('DOMContentLoaded', function() {
    // Controle das abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Atualizar botões ativos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar formulário correto
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Alternar campos de registro
    window.toggleRegistrationFields = function() {
        const userType = document.getElementById('regUserType').value;
        const motoristaFields = document.getElementById('motoristaFields');
        const empresaFields = document.getElementById('empresaFields');
        
        motoristaFields.style.display = 'none';
        empresaFields.style.display = 'none';
        
        if (userType === 'motorista') {
            motoristaFields.style.display = 'block';
        } else if (userType === 'empresa') {
            empresaFields.style.display = 'block';
        }
    };
    
    // Validação do formulário de login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userType = document.getElementById('userType').value;
        
        // Validação básica
        if (!email || !password || !userType) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        // Simulação de login - na implementação real, isso será uma chamada API
        console.log('Login attempt:', { email, userType });
        
        // Redirecionar baseado no tipo de usuário
        switch(userType) {
            case 'passageiro':
                window.location.href = 'pages/passageiro/dashboard.html';
                break;
            case 'motorista':
                window.location.href = 'pages/motorista/dashboard.html';
                break;
            case 'empresa':
                window.location.href = 'pages/empresa/dashboard.html';
                break;
        }
    });
    
    // Validação do formulário de registro
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const userType = document.getElementById('regUserType').value;
        
        // Validação básica
        if (!name || !email || !phone || !password || !userType) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        if (password.length < 8) {
            alert('A senha deve ter pelo menos 8 caracteres');
            return;
        }
        
        // Dados adicionais
        let additionalData = {};
        if (userType === 'motorista') {
            additionalData.cartaConducao = document.getElementById('regCartaConducao').value;
            additionalData.empresa = document.getElementById('regEmpresa').value;
        } else if (userType === 'empresa') {
            additionalData.nif = document.getElementById('regNIF').value;
            additionalData.endereco = document.getElementById('regEndereco').value;
        }
        
        // Simulação de cadastro
        const userData = {
            name,
            email,
            phone,
            password,
            userType,
            ...additionalData,
            createdAt: new Date().toISOString()
        };
        
        console.log('Registration data:', userData);
        
        // Aqui você faria uma chamada AJAX para o backend PHP
        // fetch('backend/api/register.php', { method: 'POST', body: JSON.stringify(userData) })
        
        alert('Conta criada com sucesso! Faça login para continuar.');
        
        // Voltar para aba de login
        tabButtons[0].click();
        document.getElementById('loginEmail').value = email;
        document.getElementById('userType').value = userType;
    });
    
    // Formatação do telefone
    document.getElementById('regPhone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('244')) {
            value = '+244 ' + value.substring(3);
        } else if (value.length > 0) {
            value = '+244 ' + value;
        }
        e.target.value = value;
    });
});