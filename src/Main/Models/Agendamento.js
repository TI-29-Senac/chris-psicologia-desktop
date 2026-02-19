import db from '../Database/db.js';
import { v4 as uuidv4 } from 'uuid';
import mysqlService from '../Service/MySQLService.js';
import UsuarioModel from './Usuario.js';

class AgendamentoModel {
    constructor() {
        this.mysql = mysqlService;
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
                'pendente'
            );

            // 2. Tenta Sync Imediato (MySQL Direto)
            this.sincronizacaoBidirecional().catch(e => console.warn("Sync automático pós-cadastro falhou (será tentado depois):", e.message));

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
                    id_profissional = ?,
                    sincronizado = 0,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id_agendamento = ?
            `).run(dados.data_agendamento, dados.id_profissional || dados.id_profissional_antigo, dados.id_agendamento);

            // 2. Tenta Sync Imediato
            this.sincronizacaoBidirecional().catch(e => console.warn("Sync automático pós-edição falhou:", e.message));

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

            // 2. Tenta Sync Imediato
            this.sincronizacaoBidirecional().catch(e => console.warn("Sync automático pós-remoção falhou:", e.message));

            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async cancelar(id) {
        try {
            // Atualiza status local
            db.prepare("UPDATE agendamento SET status_consulta = 'cancelada', sincronizado = 0 WHERE id_agendamento = ?").run(id);

            // 2. Tenta Sync Imediato
            this.sincronizacaoBidirecional().catch(e => console.warn("Sync automático pós-cancelamento falhou:", e.message));

            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async alterarStatus(id, status) {
        try {
            const validos = ['pendente', 'confirmada', 'cancelada', 'realizada'];
            if (!validos.includes(status)) {
                return { success: false, erro: `Status inválido: ${status}` };
            }

            db.prepare("UPDATE agendamento SET status_consulta = ?, sincronizado = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id_agendamento = ?")
                .run(status, id);

            // Tenta Sync Imediato
            this.sincronizacaoBidirecional().catch(e => console.warn("Sync automático pós-alteração de status falhou:", e.message));

            return { success: true };
        } catch (error) {
            console.error("Erro ao alterar status:", error);
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

    async sincronizacaoBidirecional() {
        try {
            console.log("Iniciando Sincronização Geral (Usuários -> Agendamentos)...");

            // 1. Sincroniza Usuários Antes (Garante Integridade Referencial - FKs)
            try {
                const usuarioModel = new UsuarioModel();
                const resUser = await usuarioModel.sincronizacaoBidirecional();
                if (!resUser.success) {
                    console.warn("Aviso: Sincronização de usuários falhou ou ficou incompleta. Continuando com agendamentos...");
                }
            } catch (errUser) {
                console.error("Erro Crítico ao Sincronizar Usuários (Pré-req Agendamento):", errUser);
            }

            console.log("Iniciando Sincronização Direta de Agendamentos (MySQL)...");

            let enviados = 0;
            let falhas = 0;
            let erros = [];

            // --- PUSH (Local -> Remoto) ---
            const pendentes = db.prepare('SELECT * FROM agendamento WHERE sincronizado = 0').all();
            console.log(`[SYNC AGENDAMENTO] Itens pendentes de envio: ${pendentes.length}`);

            for (const item of pendentes) {
                try {
                    // Mapeamento de Status (Local -> Remoto) para evitar Data Truncated
                    const mapaStatus = {
                        'Agendado': 'pendente',
                        'Cancelado': 'cancelada',
                        'Realizado': 'realizada'
                    };
                    // Normaliza para capturar variações de Case e Espaços
                    const statusLocal = (item.status_consulta || '').trim();
                    // Tenta mapear direto ou via lowercase
                    let statusEnvio = mapaStatus[statusLocal]
                        || mapaStatus[statusLocal.charAt(0).toUpperCase() + statusLocal.slice(1).toLowerCase()]
                        || statusLocal.toLowerCase(); // Fallback final para lowercase

                    // Garante que é um dos valores válidos do ENUM MySQL, senão força 'pendente'
                    const validos = ['pendente', 'confirmada', 'cancelada', 'realizada'];
                    if (!validos.includes(statusEnvio)) {
                        console.warn(`[SYNC WARNING] Status '${item.status_consulta}' desconhecido. Forçando 'pendente'.`);
                        statusEnvio = 'pendente';
                    }

                    // Verifica se é UUID (novo localmente) ou ID Numérico (já existente no server)
                    const isUuid = item.id_agendamento.toString().length > 15; // UUID tem 36
                    console.log(`[SYNC] Processando item ${item.id_agendamento} (Status: ${item.status_consulta} -> ${statusEnvio})`);

                    if (item.excluido_em) {
                        console.log(`[SYNC] Excluindo item ${item.id_agendamento} no remoto`);
                        // REMOÇÃO
                        if (!isUuid) { // Só faz sentido deletar no server se ele já conhece o ID
                            await this.mysql.query(
                                'UPDATE agendamento SET excluido_em = NOW() WHERE id_agendamento = ?',
                                [item.id_agendamento]
                            );
                        }
                        db.prepare('UPDATE agendamento SET sincronizado = 1 WHERE id_agendamento = ?').run(item.id_agendamento);
                        enviados++;

                    } else if (isUuid) {
                        // CADASTRO (INSERT)
                        // Não enviamos o ID (UUID), deixamos o Auto-Increment do MySQL gerar
                        console.log(`[SYNC] Inserindo novo item ${item.id_agendamento} no MySQL...`);
                        const result = await this.mysql.query(
                            `INSERT INTO agendamento (id_usuario, id_profissional, data_agendamento, status_consulta) 
                             VALUES (?, ?, ?, ?)`,
                            [item.id_usuario, item.id_profissional, item.data_agendamento, statusEnvio]
                        );

                        // Pega o ID gerado pelo MySQL
                        const insertId = result.insertId;
                        console.log(`[SYNC] Sucesso! ID Gerado no MySQL: ${insertId}`);

                        if (insertId) {
                            console.log(`Atualizando ID Local (Agendamento): UUID(${item.id_agendamento}) -> MySQL(${insertId})`);
                            db.prepare('UPDATE agendamento SET id_agendamento = ?, sincronizado = 1 WHERE id_agendamento = ?')
                                .run(insertId.toString(), item.id_agendamento);
                        }
                        enviados++;

                    } else {
                        // EDIÇÃO (UPDATE)
                        // Se já tem ID numérico, atualiza lá
                        console.log(`[SYNC] Atualizando item ${item.id_agendamento} no MySQL...`);
                        await this.mysql.query(
                            `UPDATE agendamento SET 
                                id_usuario = ?, 
                                id_profissional = ?, 
                                data_agendamento = ?, 
                                status_consulta = ?
                             WHERE id_agendamento = ?`,
                            [item.id_usuario, item.id_profissional, item.data_agendamento, statusEnvio, item.id_agendamento]
                        );

                        db.prepare('UPDATE agendamento SET sincronizado = 1 WHERE id_agendamento = ?').run(item.id_agendamento);
                        enviados++;
                    }
                } catch (errItem) {
                    console.error(`[SYNC ERROR] Falha ao sincronizar item ${item.id_agendamento}:`, errItem.message);
                    falhas++;
                    erros.push(`Item ${item.id_agendamento}: ${errItem.message}`);
                }
            }

            // --- PULL (Remoto -> Local) ---
            // CORREÇÃO BASEADA NO PHP: O valor vem da tabela profissional (valor_consulta)
            const rows = await this.mysql.query(`
                SELECT a.*, p.valor_consulta 
                FROM agendamento a 
                LEFT JOIN profissional p ON a.id_profissional = p.id_profissional
            `);

            console.log(`[SYNC AGENDAMENTO] ${rows ? rows.length : 0} agendamentos encontrados no MySQL.`);

            if (rows && rows.length > 0) {
                const stmtUpsert = db.prepare(`
                    INSERT INTO agendamento (id_agendamento, id_usuario, id_profissional, data_agendamento, status_consulta, observacoes, valor_agendamento, status_pagamento, sincronizado, excluido_em)
                    VALUES (@id, @id_user, @id_prof, @data, @status, @obs, @valor, @pgto, 1, @excluido)
                    ON CONFLICT(id_agendamento) DO UPDATE SET
                        id_usuario = excluded.id_usuario,
                        id_profissional = excluded.id_profissional,
                        data_agendamento = excluded.data_agendamento,
                        status_consulta = excluded.status_consulta,
                        observacoes = excluded.observacoes,
                        valor_agendamento = excluded.valor_agendamento,
                        status_pagamento = excluded.status_pagamento,
                        sincronizado = 1,
                        excluido_em = excluded.excluido_em
                `);

                const checkStmt = db.prepare('SELECT * FROM agendamento WHERE id_agendamento = ?');

                const transacao = db.transaction((lista) => {
                    for (const r of lista) {
                        try {
                            // Anti-Ressurreição
                            const local = checkStmt.get(r.id_agendamento.toString());
                            if (local && local.sincronizado === 0 && local.excluido_em) {
                                console.log(`[SYNC SKIP] Agendamento ${r.id_agendamento} ignorado (excluído localmente).`);
                                continue;
                            }

                            const idUser = r.id_usuario ? Math.floor(r.id_usuario).toString() : null;
                            const idProf = r.id_profissional ? Math.floor(r.id_profissional).toString() : null;
                            const dtAgendamento = r.data_agendamento;

                            // Validação Básica
                            if (!idUser || !idProf || !dtAgendamento) {
                                console.warn(`[SYNC SKIP] Dados inválidos para agendamento ${r.id_agendamento}: User=${idUser}, Prof=${idProf}, Data=${dtAgendamento}`);
                                continue;
                            }

                            stmtUpsert.run({
                                id: r.id_agendamento.toString(),
                                id_user: idUser,
                                id_prof: idProf,
                                data: dtAgendamento,
                                status: r.status_consulta || 'pendente',
                                obs: r.observacoes || '',
                                valor: r.valor_consulta || 0, // Pega do JOIN com profissional
                                pgto: r.status_pagamento || 'pendente',
                                excluido: r.excluido_em || null
                            });
                            // console.log(`[SYNC OK] Agendamento ${r.id_agendamento} inserido/atualizado.`);
                        } catch (errLoop) {
                            console.error(`[SYNC FAIL] Erro ao inserir agendamento ${r.id_agendamento}:`, errLoop);
                        }
                    }
                });

                try {
                    db.pragma('foreign_keys = OFF');
                    transacao(rows);
                } finally {
                    db.pragma('foreign_keys = ON');
                }
            }

            return { success: true, enviados, falhas, erros };

        } catch (error) {
            console.error("Erro Sync Direto Agendamentos:", error);
            return { success: false, erro: error.message };
        }
    }
}

export default AgendamentoModel;