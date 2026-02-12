import { ipcMain } from 'electron';
import db from '../Database/db.js';

class DashboardController {

    init() {
        ipcMain.handle('dashboard:getData', async () => this.getStats());
    }

    async getStats() {
        try {
            console.log("DashboardController: Coletando estatísticas...");

            // 1. Agendamentos - Próximos 6 Meses (Visão Futura)
            const today = new Date();
            // Começa do dia 1 do mês atual para pegar o mês cheio
            const startRange = new Date(today.getFullYear(), today.getMonth(), 1);
            const startStr = startRange.toISOString().split('T')[0];

            console.log(`Buscando agendamentos a partir de: ${startStr}`);

            // Agrupa por Mês
            const sqlAgendamentos = `
                SELECT strftime('%Y-%m', data_agendamento) as mes_ano, count(*) as total
                FROM agendamento
                WHERE date(data_agendamento) >= ?
                AND excluido_em IS NULL
                GROUP BY strftime('%Y-%m', data_agendamento)
                ORDER BY mes_ano ASC
                LIMIT 6
            `;
            const agendamentosRows = db.prepare(sqlAgendamentos).all(startStr);

            // Mapeamento de Meses
            const mesesPt = {
                '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
                '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
            };

            const labelsAgendamento = [];
            const dataAgendamento = [];

            // Gera os próximos 6 meses para garantir labels contínuos (mesmo sem dados)
            for (let i = 0; i < 6; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
                const mesStr = (d.getMonth() + 1).toString().padStart(2, '0');
                const anoStr = d.getFullYear();
                const key = `${anoStr}-${mesStr}`;

                const found = agendamentosRows.find(r => r.mes_ano === key);

                labelsAgendamento.push(mesesPt[mesStr]);
                dataAgendamento.push(found ? found.total : 0);
            }


            // 2. Status dos Usuários (Pacientes)
            const usersAtivos = db.prepare("SELECT count(*) as total FROM usuario WHERE excluido_em IS NULL AND tipo_usuario = 'cliente' AND status_usuario = 'ativo'").get().total;
            const usersInativos = db.prepare("SELECT count(*) as total FROM usuario WHERE (excluido_em IS NOT NULL OR status_usuario = 'inativo') AND tipo_usuario = 'cliente'").get().total;

            // Novos (últimos 30 dias)
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const dateMonthStr = oneMonthAgo.toISOString().split('T')[0];
            const usersNovos = db.prepare("SELECT count(*) as total FROM usuario WHERE criado_em >= ? AND excluido_em IS NULL AND tipo_usuario = 'cliente'").get(dateMonthStr).total;


            // 3. Receita Mensal (Últimos 6 meses)
            // Agrupado por Mês/Ano
            const sqlFinance = `
                SELECT strftime('%Y-%m', p.criado_em) as mes_ano, SUM(a.valor_agendamento) as total
                FROM pagamento p
                JOIN agendamento a ON p.id_agendamento = a.id_agendamento
                WHERE p.excluido_em IS NULL
                GROUP BY strftime('%Y-%m', p.criado_em)
                ORDER BY mes_ano DESC
                LIMIT 6
            `;
            const financeRows = db.prepare(sqlFinance).all();

            // Inverte para ficar cronológico (Jan -> Fev -> Mar)
            const financeLabels = [];
            const financeData = [];



            // Preenche array invertido
            for (let i = financeRows.length - 1; i >= 0; i--) {
                const row = financeRows[i];
                const [ano, mes] = row.mes_ano.split('-');
                financeLabels.push(`${mesesPt[mes]}`); // Ex: Jan
                financeData.push(row.total);
            }

            return {
                chartAgendamentos: {
                    labels: labelsAgendamento,
                    data: dataAgendamento
                },
                chartUsuarios: {
                    data: [usersAtivos, usersInativos, usersNovos] // Ordem: Ativos, Inativos, Novos
                },
                chartFinanceiro: {
                    labels: financeLabels,
                    data: financeData
                }
            };

        } catch (error) {
            console.error("Erro DashboardController:", error);
            return { error: error.message };
        }
    }
}

export default DashboardController;
