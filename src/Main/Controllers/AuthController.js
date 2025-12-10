import { ipcMain } from 'electron';
import AuthModel from '../Models/Auth.js';
let usuarioLogado = null;

class AuthController {
    constructor() {
        this.authModel = new AuthModel();
    }

    init() {
        // Escuta o pedido de login vindo do Front (renderer.js)
        ipcMain.handle('auth:login', async (event, dados) => {
            return await this.login(dados);
        });

        // Escuta pedido para pegar usuário atual
        ipcMain.handle('auth:get-user', () => {
            return this.getCurrentUser();
        });
    }

    async login(dados) {
        try {
            if (!dados.email || !dados.senha) {
                return { success: false, erro: "Preencha e-mail e senha." };
            }

            // 1. Buscar usuário por email
            const usuario = db.prepare("SELECT * FROM usuario WHERE email_usuario = ? AND excluido_em IS NULL").get(dados.email);
            
            if (!usuario) {
                return { success: false, erro: "E-mail ou senha inválidos." };
            }

            // 2. Verificar a senha
            // Nota: No seu banco a coluna é 'senha_usuario' ou 'senha'? Ajustei para 'senha_usuario' baseado no seu SQL anterior
            const hashBanco = usuario.senha_usuario; 
            const senhaCorreta = bcrypt.compareSync(dados.senha, hashBanco);

            if (!senhaCorreta) {
                // Fallback (se tiver senhas antigas sem hash)
                if (hashBanco !== dados.senha) {
                    return { success: false, erro: "E-mail ou senha inválidos." };
                }
            }
            
            // 3. Verificar o tipo de acesso
            const tiposPermitidos = ['admin', 'psicólogo', 'secretaria', 'profissional'];
            if (!tiposPermitidos.includes(usuario.tipo_usuario)) {
                return { success: false, erro: "Seu tipo de usuário não tem permissão para acessar o aplicativo desktop." };
            }

            // 4. Salvar a sessão (in-memory)
            usuarioLogado = {
                id: usuario.id_usuario,
                nome: usuario.nome_usuario,
                email: usuario.email_usuario,
                tipo: usuario.tipo_usuario
            };

            return { success: true, usuario: usuarioLogado };

        } catch (error) {
            console.error("Erro no login:", error);
            return { success: false, erro: "Erro interno no servidor." };
        }
    }
getCurrentUser() {
        return usuarioLogado;
    }
}

export default AuthController;