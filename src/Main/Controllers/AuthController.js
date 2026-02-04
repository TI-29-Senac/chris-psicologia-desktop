import { ipcMain } from 'electron';
import AuthModel from '../Models/Auth.js';
import SecureStorage from '../Utils/SecureStorage.js';

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

        // Logout
        ipcMain.handle('auth:logout', async () => {
            return await this.logout();
        });
    }

    async login(dados) {
        try {
            // 1. Chama a Model (que vai chamar a API externa)
            const resposta = await this.authModel.login(dados.email, dados.senha);

            console.log("Resposta AuthModel:", resposta);

            // 2. Se a API retornou sucesso, verificamos o tipo do usuário
            // A API pode retornar estrutura plana (usuario) ou aninhada (data.usuario)
            const usuario = resposta.usuario || (resposta.data && resposta.data.usuario);

            if (resposta.success && usuario) {

                // Pega o tipo (pode vir como 'tipo' ou 'tipo_usuario' dependendo da API)
                const tipo = usuario.tipo || usuario.tipo_usuario;

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
                usuarioLogado = usuario;

                // SALVAR TOKENS SEGURAMENTE
                // Verifica se os tokens estão na raiz ou dentro de 'data'
                const token = resposta.token || (resposta.data && resposta.data.token);
                const refreshToken = resposta.refresh_token || (resposta.data && resposta.data.refresh_token);

                if (token && refreshToken) {
                    SecureStorage.saveTokens(token, refreshToken);
                } else {
                    console.warn("Tokens não encontrados na resposta da API (Login Offline ou falha).");
                }
            }

            return resposta;
        } catch (error) {
            console.error("Erro no Controller Auth:", error);
            // Log do erro real para ajudar na depuração
            console.error("Stack Trace:", error.stack);
            return { success: false, erro: `Erro interno: ${error.message}` };
        }
    }

    async logout() {
        try {
            // Limpa sessão em memória
            usuarioLogado = null;

            // Limpa tokens seguros
            SecureStorage.clearTokens();

            // Opcional: Avisar backend (se necessário)
            // await this.authModel.logout(); 

            return { success: true };
        } catch (error) {
            console.error("Erro no Logout:", error);
            return { success: false, erro: "Erro ao deslogar." };
        }
    }

    getCurrentUser() {
        return usuarioLogado;
    }
}

export default AuthController;