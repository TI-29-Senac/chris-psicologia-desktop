import './index.css';

console.log('Renderer process started');

// Carousel Logic
const startCarousel = () => {
    const images = document.querySelectorAll('.bg-image');
    if (images.length === 0) return;

    let currentIndex = 0;

    // Ensure only the first one is active initially (handled by HTML class but good to be safe)
    images.forEach((img, index) => {
        if (index !== 0) img.classList.remove('active');
        else img.classList.add('active');
    });

    setInterval(() => {
        // Remove active from current
        images[currentIndex].classList.remove('active');

        // Move to next
        currentIndex = (currentIndex + 1) % images.length;

        // Add active to next
        images[currentIndex].classList.add('active');
    }, 5000); // 5 seconds
};

// Start carousel when DOM is ready
document.addEventListener('DOMContentLoaded', startCarousel);

const loginForm = document.getElementById('login-form');
const msgErro = document.getElementById('mensagem-erro');
const btnLogin = document.getElementById('btn-login');

// Listener para Sessão Expirada (vindo do Main process)
if (window.electronAPI && window.electronAPI.onSessionExpired) {
    window.electronAPI.onSessionExpired(() => {
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        window.location.href = '../../index.html'; // Ajuste o caminho se necessário
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Limpa mensagens e desabilita botão
        if (msgErro) msgErro.textContent = '';
        if (btnLogin) {
            btnLogin.disabled = true;
            btnLogin.textContent = 'Entrando...';
        }

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            console.log("Tentando login via Electron API (localhost)...");

            // Chama o Main Process -> Controller -> Model -> API Local
            // A resposta agora já contém tokens salvos no SecureStorage (Main Process)
            const resposta = await window.electronAPI.login({ email, senha });

            console.log("Resposta do Login:", resposta);

            if (resposta && resposta.success) { // Verifique se a API retorna 'success' ou 'status: success'
                if (msgErro) {
                    msgErro.style.color = 'green';
                    msgErro.textContent = 'Login realizado! Redirecionando...';
                }

                // Salva dados básicos do usuário (apenas para UI)
                // TOKENS NÃO SÃO SALVOS AQUI, ELES FICAM NO SECURE STORAGE (MAIN)
                localStorage.setItem('usuario_logado', JSON.stringify(resposta.data ? resposta.data.usuario : resposta.usuario));

                // Limpa token antigo se existir (legado)
                localStorage.removeItem('auth_token');

                // Redireciona
                setTimeout(() => {
                    // Verifique se este caminho está correto na sua estrutura final de pastas
                    window.location.href = 'src/Renderer/Views/Dashboard/dashboard.html';
                }, 1000);

            } else {
                throw new Error(resposta.erro || resposta.error || 'Credenciais inválidas ou erro na API.');
            }

        } catch (error) {
            console.error('Erro detalhado:', error);
            if (msgErro) {
                msgErro.style.color = '#e74c3c';
                msgErro.textContent = error.message;
            } else {
                alert(error.message);
            }
        } finally {
            if (btnLogin) {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Entrar';
            }
        }
    });
}
