import db from '../Database/db.js';

class DashboardModel {

    // 1. Fluxo de Agendamentos (Gráfico de Linha)
    async getAgendamentosFlow(periodo = 'semana') {
        try {
            let sql = "";
            let params = [];

            if (periodo === 'mes') {
                // Últimos 30 dias, agrupado por dia
                sql = `
                    SELECT strftime('%d/%m', data_agendamento) as label, COUNT(*) as total
                    FROM agendamento
                    WHERE data_agendamento >= date('now', '-30 days')
                    AND excluido_em IS NULL
                    GROUP BY label
                    ORDER BY data_agendamento ASC
                `;
            } else {
                // Padrão: Esta semana (últimos 7 dias)
                sql = `
                    SELECT 
                        CASE CAST(strftime('%w', data_agendamento) AS INTEGER)
                            WHEN 0 THEN 'Dom'
                            WHEN 1 THEN 'Seg'
                            WHEN 2 THEN 'Ter'
                            WHEN 3 THEN 'Qua'
                            WHEN 4 THEN 'Qui'
                            WHEN 5 THEN 'Sex'
                            WHEN 6 THEN 'Sáb'
                        END as label,
                        COUNT(*) as total,
                        data_agendamento -- Para ordenação
                    FROM agendamento
                    WHERE data_agendamento >= date('now', '-6 days')
                    AND excluido_em IS NULL
                    GROUP BY label
                    ORDER BY data_agendamento ASC
                `;
            }

            const rows = db.prepare(sql).all(params);

            // Retorna arrays separados para o Chart.js
            return {
                labels: rows.map(r => r.label),
                data: rows.map(r => r.total)
            };

        } catch (error) {
            console.error("Erro Dashboard (Agendamentos):", error);
            return { labels: [], data: [] };
        }
    }

    // 2. Status dos Pacientes (Gráfico Doughnut)
    async getPacientesStatus() {
        try {
            // Ativos: status = 'ativo'
            const ativos = db.prepare("SELECT COUNT(*) as total FROM usuario WHERE tipo_usuario = 'cliente' AND status_usuario = 'ativo' AND excluido_em IS NULL").get().total;

            // Inativos: status != 'ativo'
            const inativos = db.prepare("SELECT COUNT(*) as total FROM usuario WHERE tipo_usuario = 'cliente' AND status_usuario != 'ativo' AND excluido_em IS NULL").get().total;

            // Novos: Criados nos últimos 30 dias
            const novos = db.prepare("SELECT COUNT(*) as total FROM usuario WHERE tipo_usuario = 'cliente' AND criado_em >= date('now', '-30 days') AND excluido_em IS NULL").get().total;

            return {
                labels: ['Ativos', 'Inativos', 'Novos (30d)'],
                data: [ativos, inativos, novos]
            };

        } catch (error) {
            console.error("Erro Dashboard (Pacientes):", error);
            return { labels: [], data: [] };
        }
    }

    // 3. Financeiro (Gráfico de Barras)
    async getFinanceiro(ano) {
        try {
            if (!ano) ano = new Date().getFullYear();
            console.log(`[DashboardModel] Buscando financeiro para o ano: ${ano}`);

            // DEBUG: Total de pagamentos no banco (independente de ano/exclusão)
            const debugTotal = db.prepare("SELECT COUNT(*) as qtd, SUM(valor) as total_valor FROM pagamento").get();
            console.log(`[DashboardModel] DEBUG GERAL: ${debugTotal.qtd} pagamentos no DB. Soma total: ${debugTotal.total_valor}`);

            // Soma pagamentos agrupados por mês
            const sql = `
                SELECT 
                    strftime('%m', criado_em) as mes,
                    SUM(valor) as total
                FROM pagamento
                WHERE strftime('%Y', criado_em) = ?
                AND excluido_em IS NULL
                GROUP BY mes
                ORDER BY mes ASC
            `;

            const rows = db.prepare(sql).all(ano.toString());
            console.log(`[DashboardModel] Resultado financeiro para ${ano}:`, rows);

            // Preenche os 12 meses (inclusive os zerados)
            const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const valores = new Array(12).fill(0);

            rows.forEach(r => {
                const index = parseInt(r.mes) - 1; // '01' -> 0
                if (index >= 0 && index < 12) {
                    valores[index] = r.total;
                }
            });

            return {
                labels: mesesNomes,
                data: valores
            };

        } catch (error) {
            console.error("Erro Dashboard (Financeiro):", error);
            return { labels: [], data: [] };
        }
    }

    // 4. Anos Disponíveis (Para o filtro)
    async getAnosDisponiveis() {
        try {
            const sql = `
                SELECT DISTINCT strftime('%Y', criado_em) as ano
                FROM pagamento
                WHERE excluido_em IS NULL
                ORDER BY ano DESC
            `;
            const rows = db.prepare(sql).all();
            const anos = rows.map(r => r.ano).filter(a => a); // Remove nulos

            // Garante que o ano atual esteja na lista, mesmo sem dados
            const anoAtual = new Date().getFullYear().toString();
            if (!anos.includes(anoAtual)) {
                anos.unshift(anoAtual);
            }
            return anos;
        } catch (error) {
            console.error("Erro Dashboard (Anos Disponíveis):", error);
            return [new Date().getFullYear().toString()];
        }
    }

    // 5. Resumo Geral
    async getResumo() {
        return {
            agendamentos: await this.getAgendamentosFlow('semana'),
            pacientes: await this.getPacientesStatus(),
            financeiro: await this.getFinanceiro(new Date().getFullYear()),
            anosFinanceiro: await this.getAnosDisponiveis() // Envia junto com o resumo
        };
    }
}

export default DashboardModel;
