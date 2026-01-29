import FetchAPI from '../Service/FetchAPI.js';

class UsuarioModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // GET /usuarios na API local
            const resultado = await this.api.get('usuarios');
            
            // Tratamento de erro caso a API retorne { success: false }
            if (resultado && resultado.success === false) {
                console.error("Erro API Listar Usuários:", resultado.erro);
                return [];
            }
            
            // Retorna o array de dados para o Controller
            return Array.isArray(resultado) ? resultado : (resultado.data || []);
        } catch (error) {
            console.error("Erro na Model Usuario (listar):", error);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            return await this.api.get(`usuarios/${id}`);
        } catch (error) {
            console.error("Erro na Model Usuario (buscarPorId):", error);
            return null;
        }
    }

    async cadastrar(dados) {
        try {
            // Rota corrigida conforme o log do terminal: 'usuarios/salvar'
            return await this.api.post('usuarios/salvar', dados); 
        } catch (error) {
            console.error("Erro na Model Usuario (cadastrar):", error);
            return { success: false, erro: error.message };
        }
    }

    async editar(dados) {
        try {
            // Adicionado para suportar a função editarUsuario do seu preload.js
            // Geralmente utiliza a rota de salvar ou uma específica de update
            return await this.api.post('usuarios/salvar', dados); 
        } catch (error) {
            console.error("Erro na Model Usuario (editar):", error);
            return { success: false, erro: error.message };
        }
    }
    
    async excluir(id) {
        try {
            // Implementação padrão de exclusão via POST ou DELETE
            return await this.api.post(`usuarios/excluir/${id}`);
        } catch (error) {
            console.error("Erro na Model Usuario (excluir):", error);
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioModel;