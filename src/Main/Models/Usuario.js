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
            
            // Se a API retornar o array direto ou dentro de 'data', ajuste aqui
            // Assumindo que retorna um array ou { data: [...] }
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
            // POST /usuarios na API local
            return await this.api.post('usuarios', dados);
        } catch (error) {
            console.error("Erro na Model Usuario (cadastrar):", error);
            return { success: false, erro: error.message };
        }
    }
    
    // Método excluir se existir na API
    async excluir(id) {
        // Implementar se sua API tiver DELETE /usuarios/:id ou POST /usuarios/delete
        // Exemplo:
        // return await this.api.post(`usuarios/delete/${id}`);
        return { success: false, erro: "Exclusão via API não implementada ainda." };
    }
}

export default UsuarioModel;