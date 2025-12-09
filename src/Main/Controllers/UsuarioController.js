// src/Main/Controllers/ProfissionalController.js
import { ipcMain } from 'electron';
import db from '../Database/db.js';

class UsuarioController {
    
    init() {
        // Mantém o cadastro existente
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => this.cadastrar(dados));
        
        // --- NOVOS MÉTODOS ---
        ipcMain.handle('usuarios:listar', async () => this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => this.buscarPorId(id));
        ipcMain.handle('usuarios:editar', async (event, dados) => this.editar(dados));
        ipcMain.handle('usuarios:excluir', async (event, id) => this.excluir(id));
    }

    // ... seu método cadastrar existente continua aqui ...

    async listar() {
        try {
            // Traz todos os usuários (exceto senha por segurança)
            // Fazemos um LEFT JOIN para saber se é profissional e trazer dados extras
            const sql = `
                SELECT u.id_usuario, u.nome_usuario, u.email, u.tipo_usuario, 
                       p.especialidade 
                FROM usuario u
                LEFT JOIN profissional p ON u.id_usuario = p.id_usuario
                ORDER BY u.nome_usuario ASC
            `;
            return db.prepare(sql).all();
        } catch (erro) {
            console.error(erro);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            const usuario = db.prepare("SELECT * FROM usuario WHERE id_usuario = ?").get(id);
            if(usuario.tipo_usuario === 'profissional'){
                const prof = db.prepare("SELECT * FROM profissional WHERE id_usuario = ?").get(id);
                return { ...usuario, ...prof }; // Junta dados
            }
            return usuario;
        } catch (error) {
            return null;
        }
    }

    async editar(dados) {
        try {
            // Atualiza dados básicos
            const stmtUser = db.prepare(`
                UPDATE usuario SET nome_usuario = @nome, email = @email 
                WHERE id_usuario = @id_usuario
            `);
            stmtUser.run({ nome: dados.nome, email: dados.email, id_usuario: dados.id });

            // Se for profissional, atualiza dados extras
            if(dados.tipo === 'profissional') {
                const stmtProf = db.prepare(`
                    UPDATE profissional SET especialidade = @especialidade, valor_consulta = @valor
                    WHERE id_usuario = @id_usuario
                `);
                stmtProf.run({ 
                    especialidade: dados.especialidade, 
                    valor: dados.valor, 
                    id_usuario: dados.id 
                });
            }
            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }

    async excluir(id) {
        try {
            // O CASCADE do banco deve cuidar do profissional, mas por segurança:
            db.prepare("DELETE FROM usuario WHERE id_usuario = ?").run(id);
            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioController;