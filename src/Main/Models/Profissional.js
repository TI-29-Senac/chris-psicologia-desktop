import FetchAPI from '../Service/FetchAPI.js';
import db from '../Database/db.js';
import { v4 as uuidv4 } from 'uuid';

class ProfissionalModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // OFFLINE-FIRST
            return db.prepare(`
                SELECT p.*, u.nome_usuario, u.email_usuario 
                FROM profissional p
                JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE p.excluido_em IS NULL
            `).all();
        } catch (error) {
            console.error("Erro ao listar profissionais localmente:", error);
            return [];
        }
    }

    async buscarPorId(id) {
        return db.prepare(`
            SELECT p.*, u.nome_usuario 
            FROM profissional p
            JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE p.id_profissional = ?
        `).get(id);
    }

    async cadastrar(dados) {
        try {
            const novoIdProfissional = uuidv4();

            // O id_usuario DEVE vir dos dados (selecionado numa lista ou criado antes)
            if (!dados.id_usuario) {
                throw new Error("ID do Usuário é obrigatório para cadastrar Profissional.");
            }

            // 1. Salva no SQLite
            const stmt = db.prepare(`
                INSERT INTO profissional (
                    id_profissional,
                    id_usuario,
                    especialidade,
                    valor_consulta,
                    sinal_consulta
                ) VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run(
                novoIdProfissional,
                dados.id_usuario,
                dados.especialidade,
                dados.valor_consulta,
                dados.sinal_consulta || 0
            );

            // 2. Tenta enviar para API (Web Controller - Form Data)
            const dadosParaAPI = { ...dados, id_profissional: novoIdProfissional };
            try {
                // Rota: POST /profissionais/salvar (Controller Web)
                await this.api.postForm('profissionais/salvar', dadosParaAPI);
            } catch (apiErr) {
                console.warn("Offline: Profissional salvo apenas localmente.");
            }

            return { success: true, id: novoIdProfissional };

        } catch (error) {
            console.error("Erro ao cadastrar profissional:", error);
            return { success: false, erro: error.message };
        }
    }

    async editar(dados) {
        try {
            const stmt = db.prepare(`
                UPDATE profissional
                SET especialidade = ?,
                    valor_consulta = ?,
                    sinal_consulta = ?
                WHERE id_profissional = ?
            `);

            stmt.run(
                dados.especialidade,
                dados.valor_consulta,
                dados.sinal_consulta,
                dados.id_profissional
            );

            try {
                // Rota: POST /profissionais/atualizar/{id} (Controller Web)
                await this.api.postForm(`profissionais/atualizar/${dados.id_profissional}`, dados);
            } catch (e) {
                console.warn("Edição offline (Profissional).");
            }

            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async excluir(id) {
        try {
            // Soft delete local
            db.prepare("UPDATE profissional SET excluido_em = CURRENT_TIMESTAMP WHERE id_profissional = ?").run(id);

            // Tenta excluir na API
            try {
                // Rota: POST /profissionais/deletar/{id} (Controller Web) e postForm (PHP)
                await this.api.postForm(`profissionais/deletar/${id}`, {});
            } catch (e) {
                console.warn("Exclusão offline.");
            }
            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }
}

export default ProfissionalModel;
