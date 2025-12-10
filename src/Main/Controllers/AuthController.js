import { ipcMain } from 'electron';
import AuthModel from '../Models/Auth.js';

// Variável para manter a sessão na memória RAM do Desktop
let usuarioLogado = null;

class AuthController {
    constructor() {
        this.authModel = new AuthModel();
    }

    init() {
        // Recebe o pedido de login do Frontend
        ipcMain.handle('auth:login', async (event, dados) => {
            return await this.login(dados);
        });

        // Retorna o usuário logado para quem pedir
        ipcMain.handle('auth:get-user', () => {
            return this.getCurrentUser();
        });
    }

    async login(dados) {
        try {
            // 1. Chama a Model (que vai chamar a API externa)
            const resposta = await this.authModel.login(dados.email, dados.senha);

            // 2. Se a API retornou sucesso, verificamos o tipo do usuário
            if (resposta.success && resposta.usuario) {
                
                // Pega o tipo (pode vir como 'tipo' ou 'tipo_usuario' dependendo da API)
                const tipo = resposta.usuario.tipo || resposta.usuario.tipo_usuario;
                
                // 3. LISTA DE PERMISSÕES
                // Apenas estes perfis podem entrar no Desktop
                const cargosPermitidos = ['admin', 'profissional', 'psicólogo', 'secretaria', 'recepcionista'];

                if (!tipo || !cargosPermitidos.includes(tipo.toLowerCase())) {
                    // Se for cliente (ou outro não listado), negamos o acesso
                    return { 
                        success: false, 
                        erro: "Acesso restrito. Clientes devem utilizar o site." 
                    };
                }

                // Se passou na verificação, salvamos a sessão
                usuarioLogado = resposta.usuario;
            }

            return resposta;
        } catch (error) {
            console.error("Erro no Controller Auth:", error);
            return { success: false, erro: "Erro interno ao tentar logar." };
        }
    }

    getCurrentUser() {
        return usuarioLogado;
    }
}

export default AuthController;