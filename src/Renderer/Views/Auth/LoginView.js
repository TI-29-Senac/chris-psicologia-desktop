import MensagemDeAlerta from "../../Services/MensagemDeAlerta.js";

class LoginView {
    constructor() {
        this.mensagem = new MensagemDeAlerta();
    }

    renderizar() {
    return `
        <div class="container">
            <img src="../../img/logo/logochris.svg" alt="Logo Chris Psicologia" class="logo" style="max-width: 150px; margin-bottom: 20px;">
            <h2>Login Clínica</h2>
            <form id="form-login">
                <label>Email:</label>
                <input type="email" id="email" required placeholder="Digite seu e-mail"/>
                
                <label>Senha:</label>
                <input type="password" id="senha" required placeholder="Digite sua senha"/>
                
                <button type="submit">Entrar</button>
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
                    sessionStorage.setItem('usuario_logado', JSON.stringify(resposta.usuario));
                    
                    window.location.hash = "#usuario_menu"; 
                } else {
                    this.mensagem.erro(resposta.mensagem);
                }
            });
        }
    }
}
export default LoginView;