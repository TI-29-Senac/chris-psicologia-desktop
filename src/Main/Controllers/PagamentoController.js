import { ipcMain } from 'electron';
import db from '../Database/db.js';

const PagamentoController = {
    init() {
        ipcMain.handle('pagamento:listar', async () => this.listarPagamentos());
        ipcMain.handle('pagamento:processar', async (event, dados) => this.registrarPagamento(dados));
    },

    async listarPagamentos() {
        try {
            // Join complexo para trazer dados legíveis
            // Traz valor da tabela profissional se não estiver salvo no pagamento
            const sql = `
                SELECT 
                    p.id_pagamento, 
                    COALESCE(p.valor, prof.valor_consulta) as valor,
                    fp.nome_forma_pagamento as metodo,
                    'succeeded' as status,
                    p.criado_em as data,
                    u.email_usuario as email,
                    u.nome_usuario as nome_paciente
                FROM pagamento p
                JOIN formas_pagamento fp ON p.id_forma_pagamento = fp.id_forma_pagamento
                JOIN agendamento a ON p.id_agendamento = a.id_agendamento
                JOIN usuario u ON a.id_usuario = u.id_usuario
                JOIN profissional prof ON a.id_profissional = prof.id_profissional
                ORDER BY p.criado_em DESC
                LIMIT 50
            `;
            const pagamentos = db.prepare(sql).all();

            const dadosFormatados = pagamentos.map(p => ({
                id: p.id_pagamento,
                valor: p.valor ? parseFloat(p.valor).toFixed(2) : '0.00',
                status: p.status,
                metodo: p.metodo,
                data: new Date(p.data).toLocaleDateString('pt-BR') + ' ' + new Date(p.data).toLocaleTimeString('pt-BR'),
                email: p.email || p.nome_paciente
            }));

            return { success: true, data: dadosFormatados };
        } catch (error) {
            console.error('Erro ao listar pagamentos:', error);
            return { success: false, error: error.message };
        }
    },

    async registrarPagamento(dados) {
        try {
            // 1. Tenta achar o ID da forma de pagamento pelo nome enviado (ex: 'Pix')
            let forma = db.prepare("SELECT id_forma_pagamento FROM formas_pagamento WHERE nome_forma_pagamento LIKE ?").get(`%${dados.metodo}%`);
            
            // Se não achar, usa ID 1 (Dinheiro) como fallback
            const idForma = forma ? forma.id_forma_pagamento : 1;

            const stmt = db.prepare(`
                INSERT INTO pagamento (id_agendamento, id_forma_pagamento, valor, criado_em)
                VALUES (@id_agendamento, @idForma, @valor, CURRENT_TIMESTAMP)
            `);
            
            stmt.run({
                id_agendamento: dados.id_agendamento, // O frontend deve enviar isso
                idForma: idForma,
                valor: parseFloat(dados.valor)
            });

            // Atualiza status do agendamento para 'Pago' ou 'Confirmado'
            db.prepare("UPDATE agendamento SET status_consulta = 'Confirmado' WHERE id_agendamento = ?").run(dados.id_agendamento);

            return { success: true };
        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            return { success: false, error: error.message };
        }
    }
};

export default PagamentoController;