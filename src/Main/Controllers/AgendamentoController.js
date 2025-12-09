import { ipcMain } from 'electron';
import db from '../Database/db.js';

class AgendamentoController {
    
    init() {
        // --- CORREÇÃO AQUI ---
        // Antes estava 'agendamentos:create', mudei para 'agendamentos:cadastrar'
        // para bater com o seu preload.js
        ipcMain.handle('agendamentos:cadastrar', async (event, data) => this.cadastrar(data));
        
        ipcMain.handle('agendamentos:get-form-data', async () => this.getDadosAuxiliares());
        ipcMain.handle('agendamentos:listar', async () => this.listar());
        ipcMain.handle('agendamentos:remover', async (event, id) => this.removerAgendamento(id));
        ipcMain.handle('agendamentos:buscarPorId', async (event, id) => this.buscarAgendamentoPorId(id));
        ipcMain.handle('agendamentos:editar', async (event, data) => this.atualizarAgendamento(data));
        ipcMain.handle('agendamentos:cancelar', async (event, id) => this.cancelarStatus(id));
    }

    // --- REGRAS DE NEGÓCIO PRIVADAS ---

    _validarHorarioComercial(dataString) {
        const data = new Date(dataString);
        const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
        
        if (diaSemana === 0 || diaSemana === 6) {
            return { valido: false, msg: "A clínica não abre aos finais de semana." };
        }
        
        const hora = data.getHours(); 
        
        // Funcionamento: 08:00 às 11:59 E 13:00 às 17:59
        const ehManha = hora >= 8 && hora < 12;
        const ehTarde = hora >= 13 && hora < 18;

        if (!ehManha && !ehTarde) {
            return { valido: false, msg: "Horário inválido! Funcionamos das 08h às 12h e das 13h às 18h." };
        }
        return { valido: true };
    }

    // Verifica se o paciente já é cliente de outro médico
    _verificarFidelidade(id_usuario, id_profissional_desejado) {
        // Busca se existe agendamento desse paciente, com OUTRO profissional, que NÃO esteja cancelado
        const sql = `
            SELECT u_prof.nome_usuario as nome_atual
            FROM agendamento a
            JOIN profissional p ON a.id_profissional = p.id_profissional
            JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario
            WHERE a.id_usuario = @id_usuario
              AND a.id_profissional != @id_profissional_desejado
              AND a.status_consulta != 'Cancelado'
            LIMIT 1
        `;

        const vinculo = db.prepare(sql).get({ 
            id_usuario, 
            id_profissional_desejado 
        });

        if (vinculo) {
            return { 
                valido: false, 
                msg: `Este paciente já é atendido por: ${vinculo.nome_atual}. Não é permitido agendar com profissionais diferentes.` 
            };
        }

        return { valido: true };
    }

    // --- MÉTODOS CRUD ---

    async cadastrar(dados) {
        try {
            console.log("Tentando cadastrar:", dados);

            // 1. Valida Horário
            const validacaoHorario = this._validarHorarioComercial(dados.data_agendamento);
            if (!validacaoHorario.valido) return { success: false, erro: validacaoHorario.msg };

            // 2. Valida Fidelidade
            const validacaoFidelidade = this._verificarFidelidade(dados.id_usuario, dados.id_profissional);
            if (!validacaoFidelidade.valido) return { success: false, erro: validacaoFidelidade.msg };

            // 3. Valida Conflito de Agenda (Horário Ocupado)
            const conflito = db.prepare(`
                SELECT id_agendamento FROM agendamento 
                WHERE id_profissional = @id_profissional 
                  AND data_agendamento = @data_agendamento
                  AND status_consulta != 'Cancelado' 
            `).get(dados);

            if (conflito) return { success: false, erro: "Horário já ocupado para este profissional!" };

            const stmt = db.prepare(`
                INSERT INTO agendamento (id_usuario, id_profissional, data_agendamento, status_consulta) 
                VALUES (@id_usuario, @id_profissional, @data_agendamento, 'Agendado')
            `);
            const info = stmt.run(dados);
            
            return { success: true, id: info.lastInsertRowid };
        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            return { success: false, erro: erro.message };
        }
    }

    async atualizarAgendamento(dados) {
        try {
            const validacaoHorario = this._validarHorarioComercial(dados.data_agendamento);
            if (!validacaoHorario.valido) return { success: false, erro: validacaoHorario.msg };

            // Busca o agendamento atual para pegar o ID do usuário original
            const agendamentoAtual = await this.buscarAgendamentoPorId(dados.id_agendamento);
            if (!agendamentoAtual) return { success: false, erro: "Agendamento não encontrado." };

            const idUsuario = agendamentoAtual.id_usuario; 

            // Valida Fidelidade
            const validacaoFidelidade = this._verificarFidelidade(idUsuario, dados.id_profissional);
            if (!validacaoFidelidade.valido) return { success: false, erro: validacaoFidelidade.msg };

            // Valida Conflito
            const conflito = db.prepare(`
                SELECT id_agendamento FROM agendamento 
                WHERE id_profissional = @id_profissional 
                  AND data_agendamento = @data_agendamento
                  AND id_agendamento != @id_agendamento
                  AND status_consulta != 'Cancelado'
            `).get(dados);

            if (conflito) return { success: false, erro: "Horário indisponível!" };

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
            ORDER BY a.data_agendamento DESC
        `;
        return db.prepare(sql).all();
    }

    async getDadosAuxiliares() { 
        const pacientes = db.prepare("SELECT id_usuario, nome_usuario FROM usuario WHERE tipo_usuario = 'cliente'").all();
        const profissionais = db.prepare(`
            SELECT p.id_profissional, u.nome_usuario 
            FROM profissional p 
            JOIN usuario u ON p.id_usuario = u.id_usuario
        `).all();
        return { pacientes, profissionais };
    }

    async removerAgendamento(id) { 
        db.prepare("DELETE FROM agendamento WHERE id_agendamento = ?").run(id); 
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