import { ipcMain } from 'electron';
import db from '../Database/db.js';

class AgendamentoController {
    
    // Método para iniciar os ouvintes (Handlers) do IPC
    init() {
        // Dados do formulário
        ipcMain.handle('agendamentos:get-form-data', async () => {
            return this.getDadosAuxiliares();
        });

        // CRUD
        ipcMain.handle('agendamentos:create', async (event, data) => this.cadastrar(data));
        ipcMain.handle('agendamentos:listar', async () => this.listar());
        ipcMain.handle('agendamentos:remover', async (event, id) => this.removerAgendamento(id));
        ipcMain.handle('agendamentos:buscarPorId', async (event, id) => this.buscarAgendamentoPorId(id));
        ipcMain.handle('agendamentos:editar', async (event, data) => this.atualizarAgendamento(data));

        console.log("AgendamentoController: Todos os handlers foram registrados.");
    }

    // --- MÉTODOS DE LÓGICA (Banco de Dados) ---

    // 1. LISTAR (O que estava faltando)
    async listar() {
        try {
            // JOINs são necessários para pegar o nome do paciente e do profissional
            // em vez de mostrar apenas números (IDs) na tabela.
            const sql = `
                SELECT 
                    a.id_agendamento,
                    a.data_agendamento,
                    a.status_consulta,
                    u_paciente.nome_usuario AS nome_paciente,
                    u_prof.nome_usuario AS nome_profissional
                FROM agendamento a
                JOIN usuario u_paciente ON a.id_usuario = u_paciente.id_usuario
                JOIN profissional p ON a.id_profissional = p.id_profissional
                JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario
                ORDER BY a.data_agendamento DESC
            `;
            
            const rows = db.prepare(sql).all();
            return rows;

        } catch (erro) {
            console.error("Erro ao listar agendamentos:", erro);
            return []; // Retorna array vazio para não quebrar o .map no front
        }
    }

    // 2. DADOS AUXILIARES (Para o Select do Form)
    async getDadosAuxiliares() {
        try {
            const pacientes = db.prepare("SELECT id_usuario, nome_usuario FROM usuario WHERE tipo_usuario = 'cliente'").all();
            
            const profissionais = db.prepare(`
                SELECT p.id_profissional, u.nome_usuario 
                FROM profissional p
                JOIN usuario u ON p.id_usuario = u.id_usuario
            `).all();

            return { pacientes, profissionais };
        } catch (erro) {
            console.error("Erro dados auxiliares:", erro);
            return { pacientes: [], profissionais: [] };
        }
    }

    // 3. CADASTRAR
    async cadastrar(dados) {
        try {
            if (!dados.id_usuario || !dados.id_profissional || !dados.data_agendamento) {
                throw new Error("Dados incompletos.");
            }

            const stmt = db.prepare(`
                INSERT INTO agendamento (id_usuario, id_profissional, data_agendamento, status_consulta) 
                VALUES (@id_usuario, @id_profissional, @data_agendamento, 'Agendado')
            `);
            
            const info = stmt.run(dados);
            return { success: true, id: info.lastInsertRowid };

        } catch (erro) {
            console.error("Erro ao cadastrar:", erro);
            return { success: false, erro: erro.message };
        }
    }

    // 4. REMOVER
    async removerAgendamento(id) {
        try {
            const stmt = db.prepare("DELETE FROM agendamento WHERE id_agendamento = ?");
            stmt.run(id);
            return { success: true };
        } catch (erro) {
            console.error("Erro ao remover:", erro);
            return { success: false, erro: erro.message };
        }
    }

    // 5. BUSCAR POR ID (Necessário quando for editar)
    async buscarAgendamentoPorId(id) {
        try {
            const sql = "SELECT * FROM agendamento WHERE id_agendamento = ?";
            return db.prepare(sql).get(id);
        } catch (erro) {
            console.error("Erro ao buscar por ID:", erro);
            return null;
        }
    }

    // 6. ATUALIZAR
    async atualizarAgendamento(dados) {
        try {
             const stmt = db.prepare(`
                UPDATE agendamento 
                SET id_usuario = @id_usuario, 
                    id_profissional = @id_profissional, 
                    data_agendamento = @data_agendamento
                WHERE id_agendamento = @id_agendamento
            `);
            stmt.run(dados);
            return { success: true };
        } catch (erro) {
             console.error("Erro ao atualizar:", erro);
             return { success: false, erro: erro.message };
        }
    }
}

export default AgendamentoController;