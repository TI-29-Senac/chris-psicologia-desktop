import { ipcMain } from 'electron';
import db from '../Database/db.js';
import bcrypt from 'bcryptjs';


class UsuarioController {
    
    init() {
        // Registra todas as rotas que o frontend pode chamar
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => this.cadastrar(dados));
        ipcMain.handle('usuarios:listar', async () => this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => this.buscarPorId(id));
        ipcMain.handle('usuarios:excluir', async (event, id) => this.excluir(id));
        // Se precisar editar no futuro:
        ipcMain.handle('usuarios:editar', async (event, dados) => this.editar(dados));
    }

    async listar() {
        try {
            // Traz todos para a lista de admin
            const sql = `
                SELECT u.id_usuario, u.nome_usuario, u.email, u.tipo_usuario, 
                       p.especialidade 
                FROM usuario u
                LEFT JOIN profissional p ON u.id_usuario = p.id_usuario
                WHERE u.excluido_em IS NULL
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
            if (!usuario) return null;

            if(usuario.tipo_usuario === 'profissional'){
                const prof = db.prepare("SELECT * FROM profissional WHERE id_usuario = ?").get(id);
                // Retorna dados mesclados (limitado ao necessário)
                return { ...usuario, ...prof }; 
            }
            return usuario;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async cadastrar(dados) {
        try {
            if (!dados.nome || !dados.email || !dados.senha) {
                return { success: false, erro: "Preencha os campos obrigatórios." };
            }

            const existe = db.prepare("SELECT id_usuario FROM usuario WHERE email = ?").get(dados.email);
            if (existe) return { success: false, erro: "E-mail já cadastrado." };

            // Transação para garantir integridade
            const insertUser = db.transaction(() => {
                const stmtUser = db.prepare(`
                    INSERT INTO usuario (nome_usuario, email, senha, tipo_usuario) 
                    VALUES (@nome, @email, @senha, @tipo)
                `);
                const hash = bcrypt.hashSync(dados.senha, 10);
                
                const info = stmtUser.run({
                    nome: dados.nome,
                    email: dados.email,
                    senha: dados.senha, // Sugestão: Usar bcrypt aqui futuramente
                    tipo: dados.tipo 
                });
                
                const novoIdUsuario = info.lastInsertRowid;

                // Só insere em profissional se for do tipo profissional
                if (dados.tipo === 'profissional') {
                    if (!dados.especialidade || !dados.valor) {
                        throw new Error("Dados de profissional incompletos.");
                    }

                    const stmtProf = db.prepare(`
                        INSERT INTO profissional (id_usuario, especialidade, valor_consulta)
                        VALUES (?, ?, ?)
                    `);
                    stmtProf.run(novoIdUsuario, dados.especialidade, parseFloat(dados.valor));
                }
            });

            insertUser();
            return { success: true };

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            return { success: false, erro: erro.message };
        }
    }

    async excluir(id) {
        try {
            // Soft delete (não apaga do banco, só esconde)
            db.prepare("UPDATE usuario SET excluido_em = CURRENT_TIMESTAMP WHERE id_usuario = ?").run(id);
            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioController;