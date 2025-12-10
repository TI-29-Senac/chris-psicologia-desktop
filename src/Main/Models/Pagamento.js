import FetchAPI from '../Service/FetchAPI.js';

class PagamentoModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // A API deve retornar o histórico de transações (ex: do Stripe)
            const resposta = await this.api.get('pagamentos');
            
            // Tratamento caso a API devolva { success: true, data: [...] }
            if (resposta.success && resposta.data) {
                return resposta;
            }
            // Caso retorne o array direto
            return { success: true, data: Array.isArray(resposta) ? resposta : [] };
        } catch (error) {
            console.error("Model Pagamento (listar):", error);
            return { success: false, error: error.message };
        }
    }

    async processar(dados) {
        try {
            return await this.api.post('pagamentos/processar', dados);
        } catch (error) {
            console.error("Model Pagamento (processar):", error);
            return { success: false, error: error.message };
        }
    }
}

export default PagamentoModel;