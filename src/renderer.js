import './index.css';

console.log('Renderer process started');

const loginForm = document.getElementById('login-form');
const msgErro = document.getElementById('mensagem-erro');
const btnLogin = document.getElementById('btn-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Limpa mensagens e desabilita botão
        if(msgErro) msgErro.textContent = '';
        if(btnLogin) {
            btnLogin.disabled = true;
            btnLogin.textContent = 'Entrando...';
        }

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            console.log("Tentando login via Electron API (localhost)...");
            
            // Chama o Main Process -> Controller -> Model -> API Local
            const data = await window.electronAPI.login({ email, senha });
            
            console.log("Resposta do Login:", data);

            if (data && data.success) {
                if(msgErro) {
                    msgErro.style.color = 'green';
                    msgErro.textContent = 'Login realizado! Redirecionando...';
                }
                
                // Salva sessão
                localStorage.setItem('usuario_logado', JSON.stringify(data.usuario));
                if(data.token) localStorage.setItem('auth_token', data.token);
                
                // Redireciona
                setTimeout(() => {
                    // Verifique se este caminho está correto na sua estrutura final de pastas
                    window.location.href = 'src/Renderer/Views/Dashboard/dashboard.html';
                }, 1000);

            } else {
                throw new Error(data.erro || data.error || 'Credenciais inválidas ou erro na API.');
            }

        } catch (error) {
            console.error('Erro detalhado:', error);
            if(msgErro) {
                msgErro.style.color = '#e74c3c';
                msgErro.textContent = error.message;
            } else {
                alert(error.message);
            }
        } finally {
            if(btnLogin) {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Entrar';
            }
        }
    });
}