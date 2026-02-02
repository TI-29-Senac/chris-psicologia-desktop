import FetchAPI from '../Service/FetchAPI.js';
import db from '../Database/db.js';

class AgendamentoModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // OFFLINE-FIRST: Busca do banco local
            // Faz um JOIN para trazer os nomes de paciente e profissional
            // assumindo que os nomes estão na tabela usuario
            const sql = `
                SELECT 
                    a.*,
                    p.nome_usuario as nome_paciente,
                    prof.nome_usuario as nome_profissional
                FROM agendamento a
                LEFT JOIN usuario p ON a.id_usuario = p.id_usuario
                LEFT JOIN usuario prof ON a.id_profissional = prof.id_usuario
                ORDER BY a.data_agendamento DESC
            `;
            return db.prepare(sql).all();
        } catch (error) {
            console.error("Model Agendamento (listar local):", error);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            return db.prepare('SELECT * FROM agendamento WHERE id_agendamento = ?').get(id);
        } catch (error) {
            console.error("Model Agendamento (buscarPorId):", error);
            return null;
        }
    }

    async cadastrar(dados) {
        try {
            // Para simplificar, vamos salvar direto na API por enquanto, 
            // mas o ideal seria salvar local e sincronizar.
            // Se salvar local, precisa criar tabela agendamento no db.js se não existir.
            // Dado o erro do usuário, a prioridade é a LEITURA funcionar.

            // Tenta salvar API
            return await this.api.post('agendamentos', dados);
        } catch (error) {
            return { success: false, erro: "Erro ao salvar (API Offline): " + error.message };
        }
    }

    async editar(dados) {
        try {
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
            // BUSCA LOCAL (OFFLINE-FIRST)
            const pacientes = db.prepare("SELECT id_usuario, nome_usuario FROM usuario WHERE tipo_usuario = 'cliente' AND excluido_em IS NULL").all();
            const profissionais = db.prepare("SELECT id_usuario as id_profissional, nome_usuario FROM usuario WHERE tipo_usuario = 'profissional' AND excluido_em IS NULL").all();

            return {
                pacientes: pacientes || [],
                profissionais: profissionais || []
            };
        } catch (error) {
            console.error("Model Agendamento (getDadosFormulario Local):", error);
            return { pacientes: [], profissionais: [] };
        }
    }
}

export default AgendamentoModel;