import { ipcMain } from 'electron';
import db from '../Database/db.js';

class AgendamentoController {
    
    init() {
        ipcMain.handle('agendamentos:cadastrar', async (event, data) => this.cadastrar(data));
        ipcMain.handle('agendamentos:get-form-data', async () => this.getDadosAuxiliares());
        ipcMain.handle('agendamentos:listar', async () => this.listar());
        ipcMain.handle('agendamentos:remover', async (event, id) => this.removerAgendamento(id));
        ipcMain.handle('agendamentos:buscarPorId', async (event, id) => this.buscarAgendamentoPorId(id));
        ipcMain.handle('agendamentos:editar', async (event, data) => this.atualizarAgendamento(data));
        ipcMain.handle('agendamentos:cancelar', async (event, id) => this.cancelarStatus(id));
    }

    _validarHorarioComercial(dataString) {
        const data = new Date(dataString);
        const diaSemana = data.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            return { valido: false, msg: "A clínica não abre aos finais de semana." };
        }
        const hora = data.getHours(); 
        const ehManha = hora >= 8 && hora < 12;
        const ehTarde = hora >= 13 && hora < 18;
        if (!ehManha && !ehTarde) {
            return { valido: false, msg: "Horário inválido! (08-12h e 13-18h)" };
        }
        return { valido: true };
    }

    _verificarFidelidade(id_usuario, id_profissional_desejado) {
        const sql = `
            SELECT u_prof.nome_usuario as nome_atual
            FROM agendamento a
            JOIN profissional p ON a.id_profissional = p.id_profissional
            JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario
            WHERE a.id_usuario = @id_usuario
              AND a.id_profissional != @id_profissional_desejado
              AND a.status_consulta != 'Cancelado'
              AND a.excluido_em IS NULL
            LIMIT 1
        `;
        const vinculo = db.prepare(sql).get({ id_usuario, id_profissional_desejado });
        if (vinculo) {
            return { valido: false, msg: `Paciente já atendido por: ${vinculo.nome_atual}.` };
        }
        return { valido: true };
    }

    async cadastrar(dados) {
        try {
            const validacaoHorario = this._validarHorarioComercial(dados.data_agendamento);
            if (!validacaoHorario.valido) return { success: false, erro: validacaoHorario.msg };

            const validacaoFidelidade = this._verificarFidelidade(dados.id_usuario, dados.id_profissional);
            if (!validacaoFidelidade.valido) return { success: false, erro: validacaoFidelidade.msg };

            const conflito = db.prepare(`
                SELECT id_agendamento FROM agendamento 
                WHERE id_profissional = @id_profissional 
                  AND data_agendamento = @data_agendamento
                  AND status_consulta != 'Cancelado'
                  AND excluido_em IS NULL
            `).get(dados);

            if (conflito) return { success: false, erro: "Horário já ocupado!" };

            const stmt = db.prepare(`
                INSERT INTO agendamento (id_usuario, id_profissional, data_agendamento, status_consulta) 
                VALUES (@id_usuario, @id_profissional, @data_agendamento, 'Agendado')
            `);
            const info = stmt.run(dados);
            
            return { success: true, id: info.lastInsertRowid };
        } catch (erro) {
            console.error("Erro agendamento:", erro);
            return { success: false, erro: erro.message };
        }
    }

    async atualizarAgendamento(dados) {
        try {
            const stmt = db.prepare(`
                UPDATE agendamento 
                SET id_profissional = @id_profissional, data_agendamento = @data_agendamento
                WHERE id_agendamento = @id_agendamento
            `);
            stmt.run(dados);
            return { success: true };
        } catch (erro) {
             return { success: false, erro: erro.message };
        }
    }

    async listar() {
        const sql = `
            SELECT 
                a.id_agendamento, 
                a.data_agendamento, 
                a.status_consulta, 
                u_paciente.nome_usuario AS nome_paciente, 
                u_prof.nome_usuario AS nome_profissional 
            FROM agendamento a 
            LEFT JOIN usuario u_paciente ON a.id_usuario = u_paciente.id_usuario 
            LEFT JOIN profissional p ON a.id_profissional = p.id_profissional 
            LEFT JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario 
            WHERE a.excluido_em IS NULL
            ORDER BY a.data_agendamento DESC
        `;
        return db.prepare(sql).all();
    }

    async getDadosAuxiliares() { 
        const pacientes = db.prepare("SELECT id_usuario, nome_usuario FROM usuario WHERE tipo_usuario = 'cliente' AND excluido_em IS NULL").all();
        const profissionais = db.prepare(`
            SELECT p.id_profissional, u.nome_usuario 
            FROM profissional p 
            JOIN usuario u ON p.id_usuario = u.id_usuario
            WHERE p.excluido_em IS NULL
        `).all();
        return { pacientes, profissionais };
    }

    async removerAgendamento(id) { 
        db.prepare("UPDATE agendamento SET excluido_em = CURRENT_TIMESTAMP WHERE id_agendamento = ?").run(id); 
        return { success: true }; 
    }

    async buscarAgendamentoPorId(id) { 
        return db.prepare("SELECT * FROM agendamento WHERE id_agendamento = ?").get(id); 
    }

    async cancelarStatus(id) { 
        db.prepare("UPDATE agendamento SET status_consulta = 'Cancelado' WHERE id_agendamento = ?").run(id); 
        return { success: true }; 
    }
}

export default AgendamentoController;