import { ipcMain } from 'electron';
import db from '../Database/db.js';
import bcrypt from 'bcryptjs';

class UsuarioController {
    
    init() {
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => this.cadastrar(dados));
        ipcMain.handle('usuarios:listar', async () => this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => this.buscarPorId(id));
        ipcMain.handle('usuarios:excluir', async (event, id) => this.excluir(id));
    }

    async listar() {
        try {
            // Lista usuários ativos
            const sql = `
                SELECT u.id_usuario, u.nome_usuario, u.email_usuario as email, u.tipo_usuario, 
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

            // Padroniza retorno para o frontend (que espera 'email' e não 'email_usuario')
            usuario.email = usuario.email_usuario;

            if(usuario.tipo_usuario === 'profissional'){
                const prof = db.prepare("SELECT * FROM profissional WHERE id_usuario = ?").get(id);
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

            const existe = db.prepare("SELECT id_usuario FROM usuario WHERE email_usuario = ?").get(dados.email);
            if (existe) return { success: false, erro: "E-mail já cadastrado." };

            const insertUser = db.transaction(() => {
                // Criptografa a senha
                const hash = bcrypt.hashSync(dados.senha, 10);

                // Insere usando nomes de colunas corretos
                const stmtUser = db.prepare(`
                    INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, status_usuario) 
                    VALUES (@nome, @email, @senha, @tipo, '000.000.000-00', 'ativo')
                `);
                
                const info = stmtUser.run({
                    nome: dados.nome,
                    email: dados.email,
                    senha: hash, 
                    tipo: dados.tipo
                });
                
                const novoIdUsuario = info.lastInsertRowid;

                if (dados.tipo === 'profissional') {
                    if (!dados.especialidade || !dados.valor) {
                        throw new Error("Profissionais precisam de Especialidade e Valor.");
                    }

                    const stmtProf = db.prepare(`
                        INSERT INTO profissional (id_usuario, especialidade, valor_consulta, sinal_consulta)
                        VALUES (?, ?, ?, ?)
                    `);
                    // Calcula sinal automático se não vier (20%)
                    const valor = parseFloat(dados.valor);
                    const sinal = valor * 0.2;

                    stmtProf.run(novoIdUsuario, dados.especialidade, valor, sinal);
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
            db.prepare("UPDATE usuario SET excluido_em = CURRENT_TIMESTAMP WHERE id_usuario = ?").run(id);
            return { success: true };
        } catch (error) {
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioController;