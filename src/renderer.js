import './index.css';

console.log('Renderer process started');

// URL do Backend (Mantendo a correção da pasta /backend)
const API_URL = 'https://techlaj.faustinopsy.com/backend'; 

const loginForm = document.getElementById('login-form');
const msgErro = document.getElementById('mensagem-erro');
const btnLogin = document.getElementById('btn-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Limpa erros e muda estado do botão
        if(msgErro) msgErro.textContent = '';
        if(btnLogin) {
            btnLogin.disabled = true;
            btnLogin.textContent = 'Entrando...';
        }

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            console.log(`Conectando em: ${API_URL}/api/desktop/login`);

            const response = await fetch(`${API_URL}/api/desktop/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            console.log("Resposta do servidor:", data);

            if (data.success) {
                if(msgErro) {
                    msgErro.style.color = 'green';
                    msgErro.textContent = 'Login realizado! Redirecionando...';
                }
                
                // 1. Salva os dados do usuário (Token e Informações)
                localStorage.setItem('usuario_logado', JSON.stringify(data.usuario));
                if(data.token) localStorage.setItem('auth_token', data.token);
                
                // 2. REDIRECIONAMENTO (Aqui está a mágica)
                // Pequeno delay de 1s para o usuário ver a mensagem de sucesso
                setTimeout(() => {
                    // O caminho é relativo à raiz do projeto onde está o index.html
                    // Certifique-se que o "R" de Renderer e "D" de Dashboard estão maiúsculos nas pastas reais
                    window.location.href = 'src/Renderer/Views/Dashboard/dashboard.html';
                }, 1000);

            } else {
                throw new Error(data.error || 'Credenciais inválidas');
            }

        } catch (error) {
            console.error('Erro detalhado:', error);
            if(msgErro) {
                msgErro.style.color = '#e74c3c';
                msgErro.textContent = error.message || 'Erro ao conectar com o servidor.';
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