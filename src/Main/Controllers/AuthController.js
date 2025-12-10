import { ipcMain } from 'electron';
import db from '../Database/db.js';
import bcrypt from 'bcryptjs';

class AuthController {
    init() {
        ipcMain.handle('auth:login', async (event, { email, senha }) => {
            try {
                // 1. Busca pelo nome da coluna correto: email_usuario
                const stmt = db.prepare(`
                    SELECT * FROM usuario 
                    WHERE email_usuario = ? 
                    AND (excluido_em IS NULL OR excluido_em = '')
                `);
                const usuario = stmt.get(email);

                if (!usuario) {
                    return { success: false, erro: "E-mail não encontrado." };
                }

                // 2. Compara com a coluna correta: senha_usuario
                const senhaValida = bcrypt.compareSync(senha, usuario.senha_usuario);
                
                if (!senhaValida) {
                    return { success: false, erro: "Senha incorreta." };
                }

                // 3. Pega dados extras se for profissional
                let dadosExtras = {};
                if (usuario.tipo_usuario === 'profissional') {
                    const stmtProf = db.prepare('SELECT * FROM profissional WHERE id_usuario = ?');
                    const prof = stmtProf.get(usuario.id_usuario);
                    if (prof) dadosExtras = prof;
                }

                // Remove a senha por segurança
                delete usuario.senha_usuario;

                return { 
                    success: true, 
                    usuario: { ...usuario, ...dadosExtras } 
                };

            } catch (erro) {
                console.error("Erro no login:", erro);
                return { success: false, erro: "Erro interno: " + erro.message };
            }
        });
    }
}

export default AuthController;