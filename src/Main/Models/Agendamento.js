import FetchAPI from '../Service/FetchAPI.js';

class AgendamentoModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            return await this.api.get('agendamentos');
        } catch (error) {
            console.error("Model Agendamento (listar):", error);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            return await this.api.get(`agendamentos/${id}`);
        } catch (error) {
            console.error("Model Agendamento (buscarPorId):", error);
            return null;
        }
    }

    async cadastrar(dados) {
        try {
            return await this.api.post('agendamentos', dados);
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async editar(dados) {
        try {
            // Ajuste a rota conforme sua API (ex: POST em /agendamentos/editar ou PUT)
            return await this.api.post(`agendamentos/editar/${dados.id_agendamento}`, dados);
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async remover(id) {
        try {
            return await this.api.post(`agendamentos/excluir/${id}`);
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async cancelar(id) {
        try {
            return await this.api.post(`agendamentos/cancelar/${id}`);
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    // Busca dados para preencher os selects (Pacientes e Profissionais)
    async getDadosFormulario() {
        try {
            // Faz duas chamadas paralelas para agilizar
            const [pacientes, profissionais] = await Promise.all([
                this.api.get('usuarios?tipo=cliente'),      // Rota teórica da API
                this.api.get('usuarios?tipo=profissional')  // Rota teórica da API
            ]);

            return {
                pacientes: Array.isArray(pacientes) ? pacientes : [],
                profissionais: Array.isArray(profissionais) ? profissionais : []
            };
        } catch (error) {
            console.error("Model Agendamento (getDadosFormulario):", error);
            return { pacientes: [], profissionais: [] };
        }
    }
}

export default AgendamentoModel;