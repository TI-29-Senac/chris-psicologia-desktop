import FetchAPI from '../Service/FetchAPI.js';
import db from '../Database/db.js';
import mysqlService from '../Service/MySQLService.js';

class PagamentoModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // Lista pagamentos locais com joins para exibir na tela
            const sql = `
                SELECT 
                    p.id_pagamento as id,
                    p.id_pagamento,
                    p.criado_em as data,
                    a.valor_agendamento as valor,
                    a.status_pagamento as status,
                    u.email_usuario as email,
                    u.nome_usuario as nome,
                    fp.nome_forma_pagamento as metodo
                FROM pagamento p
                JOIN agendamento a ON p.id_agendamento = a.id_agendamento
                JOIN usuario u ON a.id_usuario = u.id_usuario
                JOIN formas_pagamento fp ON p.id_forma_pagamento = fp.id_forma_pagamento
                WHERE p.excluido_em IS NULL
                ORDER BY p.criado_em DESC
            `;
            const dados = db.prepare(sql).all();
            return { success: true, data: dados };
        } catch (error) {
            console.error("Model Pagamento (listar):", error);
            return { success: false, error: error.message };
        }
    }

    async obterTotalMes() {
        try {
            // Calcula o total recebido no mês atual
            // Usa valor_agendamento pois pagamento.valor pode ser 0 (dependendo do gateway)
            const sql = `
                SELECT SUM(a.valor_agendamento) as total
                FROM pagamento p
                JOIN agendamento a ON p.id_agendamento = a.id_agendamento
                WHERE strftime('%Y-%m', p.criado_em) = strftime('%Y-%m', 'now', 'localtime')
                AND p.excluido_em IS NULL
            `;
            const resultado = db.prepare(sql).get();
            return { success: true, total: resultado.total || 0.00 };
        } catch (error) {
            console.error("Model Pagamento (totalMes):", error);
            return { success: false, error: error.message };
        }
    }

    async processar(dados) {
        try {
            // Rota: POST /api/pagamentos/salvar
            const res = await this.api.post('api/pagamentos/salvar', dados);
            return res;
        } catch (error) {
            console.error("Model Pagamento (processar):", error);
            return { success: false, error: error.message };
        }
    }

    async sincronizacaoBidirecional() {
        try {
            console.log("Iniciando Sincronização de Pagamentos (MySQL)...");

            // --- PULL (Remoto -> Local) ---
            // Traz pagamentos do MySQL e salva no SQLite
            const pagamentosRemotos = await mysqlService.query('SELECT * FROM pagamento');
            console.log("Pagamentos Remotos encontrados:", pagamentosRemotos ? pagamentosRemotos.length : 0);

            if (pagamentosRemotos && pagamentosRemotos.length > 0) {
                console.log("Iniciando inserção de pagamentos...");
                const stmtUpsert = db.prepare(`
                    INSERT INTO pagamento (
                        id_pagamento, id_agendamento, id_forma_pagamento, 
                        valor, criado_em, atualizado_em, excluido_em
                    )
                    VALUES (@id, @id_agendamento, @id_forma, @valor, @criado, @atualizado, @excluido)
                    ON CONFLICT(id_pagamento) DO UPDATE SET
                        id_agendamento = excluded.id_agendamento,
                        id_forma_pagamento = excluded.id_forma_pagamento,
                        valor = excluded.valor,
                        criado_em = excluded.criado_em,
                        atualizado_em = excluded.atualizado_em,
                        excluido_em = excluded.excluido_em
                `);

                const checkAgendamento = db.prepare('SELECT id_agendamento FROM agendamento WHERE id_agendamento = ?');
                const updateStatusAgendamento = db.prepare("UPDATE agendamento SET status_pagamento = 'succeeded' WHERE id_agendamento = ?");

                const transacao = db.transaction((lista) => {
                    let inseridos = 0;
                    for (const p of lista) {
                        try {
                            // Verifica integridade referencial (Agendamento deve existir)
                            const agendamentoExiste = checkAgendamento.get(p.id_agendamento.toString());

                            if (agendamentoExiste) {
                                stmtUpsert.run({
                                    id: p.id_pagamento.toString(),
                                    id_agendamento: p.id_agendamento.toString(),
                                    id_forma: p.id_forma_pagamento || 1, // Default 1 (Dinheiro) se nulo
                                    valor: 0,
                                    criado: p.criado_em,
                                    atualizado: p.atualizado_em || p.criado_em, // Fallback se null
                                    excluido: p.excluido_em
                                });

                                // Atualiza o status do agendamento para 'succeeded' pois existe pagamento
                                updateStatusAgendamento.run(p.id_agendamento.toString());
                                inseridos++;
                            } else {
                                console.warn(`Ignorado pagamento ${p.id_pagamento}: Agendamento ${p.id_agendamento} não encontrado localmente.`);
                            }
                        } catch (errFor) {
                            console.error("Erro no loop de pagamentos:", errFor, p);
                        }
                    }
                    console.log(`Total de pagamentos processados e inseridos no SQLite: ${inseridos}`);
                });

                try {
                    db.pragma('foreign_keys = OFF');
                    transacao(pagamentosRemotos);
                } finally {
                    db.pragma('foreign_keys = ON');
                }
            } else {
                console.log("Nenhum pagamento remoto para sincronizar.");
            }

            return { success: true, message: "Pagamentos sincronizados." };

        } catch (error) {
            console.error("Erro Sync Pagamentos:", error);
            return { success: false, erro: error.message };
        }
    }
}

export default PagamentoModel;