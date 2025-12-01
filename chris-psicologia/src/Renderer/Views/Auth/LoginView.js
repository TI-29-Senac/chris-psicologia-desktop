import MensagemDeAlerta from "../../Services/MensagemDeAlerta.js";

class LoginView {
    constructor() {
        this.mensagem = new MensagemDeAlerta();
    }

    renderizar() {
        return `
            <div class="container" style="max-width: 400px; margin-top: 50px;">
                <h2>Login Clínica</h2>
                <form id="form-login">
                    <label>Email:</label>
                    <input type="email" id="email" required placeholder="admin@chrispsicologia.com"/>
                    
                    <label>Senha:</label>
                    <input type="password" id="senha" required placeholder="Digite sua senha"/>
                    
                    <button type="submit" style="margin-top: 20px;">Entrar</button>
                </form>
            </div>
        `;
    }

    adicionarEventos() {
        const form = document.getElementById('form-login');
        if(form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const senha = document.getElementById('senha').value;

                const resposta = await window.api.login({ email, senha });

                if (resposta.sucesso) {
                    this.mensagem.sucesso("Login realizado!");
                    // Salva sessão simples (opcional)
                    sessionStorage.setItem('usuario_logado', JSON.stringify(resposta.usuario));
                    
                    // Redireciona para o menu principal
                    window.location.hash = "#usuario_menu"; 
                } else {
                    this.mensagem.erro(resposta.mensagem);
                }
            });
        }
    }
}
export default LoginView;