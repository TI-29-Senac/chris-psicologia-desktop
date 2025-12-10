import FetchAPI from '../Service/FetchAPI.js';

class AuthModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async login(email, senha) {
        try {
            // Chama a rota de login da API local
            // Ajuste o endpoint 'desktop/login' se sua API local usar outro caminho
            const resultado = await this.api.post('desktop/login', { email, senha });
            return resultado;
        } catch (error) {
            console.error("Erro na Model Auth:", error);
            return { success: false, erro: error.message };
        }
    }
}

export default AuthModel;