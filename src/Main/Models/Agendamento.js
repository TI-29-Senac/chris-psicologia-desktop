import FetchAPI from '../Service/FetchAPI.js';
import db from '../Database/db.js';
import { v4 as uuidv4 } from 'uuid';

class AgendamentoModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // OFFLINE-FIRST: Busca do banco local
            // Faz um JOIN para trazer os nomes de paciente e profissional
            const sql = `
                SELECT 
                    a.*,
                    p.nome_usuario as nome_paciente,
                    prof.nome_usuario as nome_profissional
                FROM agendamento a
                LEFT JOIN usuario p ON a.id_usuario = p.id_usuario
                LEFT JOIN usuario prof ON a.id_profissional = prof.id_usuario
                WHERE a.excluido_em IS NULL
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
            const novoId = uuidv4();

            // 1. Salva Local
            const stmt = db.prepare(`
                INSERT INTO agendamento (
                    id_agendamento, id_usuario, id_profissional, 
                    data_agendamento, status_consulta, sincronizado
                ) VALUES (?, ?, ?, ?, ?, 0)
            `);

            stmt.run(
                novoId,
                dados.id_usuario,
                dados.id_profissional,
                dados.data_agendamento,
                'Agendado'
            );

            // 2. Tenta Sync API
            try {
                const dadosApi = { ...dados, id_agendamento: novoId };
                await this.api.post('agendamentos', dadosApi);
                db.prepare('UPDATE agendamento SET sincronizado = 1 WHERE id_agendamento = ?').run(novoId);
            } catch (e) {
                console.warn("Agendamento salvo offline (Sync pendente).");
            }

            return { success: true, id: novoId };
        } catch (error) {
            console.error("Erro cadastrar agendamento:", error);
            return { success: false, erro: "Erro local: " + error.message };
        }
    }

    async editar(dados) {
        try {
            // 1. Atualiza Local
            db.prepare(`
                UPDATE agendamento SET 
                    data_agendamento = ?, 
                    sincronizado = 0,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id_agendamento = ?
            `).run(dados.data_agendamento, dados.id_agendamento);

            // 2. Tenta Sync
            try {
                await this.api.post(`agendamentos/editar/${dados.id_agendamento}`, dados);
                db.prepare('UPDATE agendamento SET sincronizado = 1 WHERE id_agendamento = ?').run(dados.id_agendamento);
            } catch (e) {
                console.warn("Edição salva offline (Sync pendente).");
            }

            return { success: true };
        } catch (error) {
            console.error("Erro ao editar:", error);
            return { success: false, erro: error.message };
        }
    }

    async remover(id) {
        try {
            // Soft Delete Local
            db.prepare('UPDATE agendamento SET excluido_em = CURRENT_TIMESTAMP, sincronizado = 0 WHERE id_agendamento = ?').run(id);

            try {
                await this.api.post(`agendamentos/excluir/${id}`);
                db.prepare('UPDATE agendamento SET sincronizado = 1 WHERE id_agendamento = ?').run(id);
            } catch (e) {
                console.warn("Remoção salva offline (Sync pendente).");
            }

            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async cancelar(id) {
        try {
            // Atualiza status local
            db.prepare("UPDATE agendamento SET status_consulta = 'Cancelado', sincronizado = 0 WHERE id_agendamento = ?").run(id);

            try {
                await this.api.post(`agendamentos/cancelar/${id}`);
                db.prepare('UPDATE agendamento SET sincronizado = 1 WHERE id_agendamento = ?').run(id);
            } catch (e) {
                console.warn("Cancelamento salvo offline (Sync pendente).");
            }

            return { success: true };
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