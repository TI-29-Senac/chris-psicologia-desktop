import SecureStorage from '../Utils/SecureStorage.js';
import { app, BrowserWindow, ipcMain } from 'electron';

// Mutex Global (Module Level) para garantir que TODAS as instâncias do FetchAPI (UsuarioModel, AuthModel, etc)
// respeitem o mesmo ciclo de refresh.
let globalRefreshPromise = null;

class FetchAPI {
    constructor() {
        // Ajuste conforme seu ambiente
        this.baseURL = "http://localhost:9000/backend/api/";
    }

    /**
     * Retorna os headers padrão com o Token de Acesso (se existir)
     */
    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const { accessToken } = SecureStorage.getTokens();

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        } else if (process.env.API_TOKEN) {
            console.log("Usando API_TOKEN fixo do .env:", process.env.API_TOKEN.substring(0, 10) + "...");
            // Fallback para Token Fixo (Seed/Admin Sync)
            headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
        } else {
            console.warn("Nenhum token encontrado (nem AccessToken nem API_TOKEN).");
        }

        // console.log("Headers gerados:", headers); // Descomente se precisar ver tudo
        return headers;

        return headers;
    }

    async get(endpoint) {
        return this._request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Envia dados como application/x-www-form-urlencoded (Formulário Padrão)
     * Necessário para backends PHP que usam $_POST e não lêem JSON nativamente
     */
    async postForm(endpoint, data) {
        // Converte objeto { a: 1, b: 2 } para a=1&b=2
        const formData = new URLSearchParams();
        for (const key in data) {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        }

        return this._request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    /**
     * Método centralizado para requisições com tratamento de Refresh Token
     */
    async _request(endpoint, options) {
        const url = `${this.baseURL}${endpoint}`;

        // 1. Adiciona headers (incluindo auth)
        // Pula injeção de token se for login
        // Também não queremos interceptar 401 no login, pois 401 no login significa senha errada, não token expirado.
        const isLogin = endpoint.includes('auth/login');

        if (!isLogin) {
            options.headers = { ...this._getHeaders(), ...options.headers };
        } else {
            // Se já veio com Content-Type (ex: postForm), respeita. Senão, assume JSON.
            const hasContentType = options.headers && options.headers['Content-Type'];
            if (!hasContentType) {
                options.headers = { ...options.headers, 'Content-Type': 'application/json' };
            }
        }

        try {
            let response = await fetch(url, options);

            // 2. Se deu 401, tenta renovar o token (exceto no login ou refresh)
            if (response.status === 401 && !isLogin && !endpoint.includes('refresh-token')) {
                console.warn(`401 em ${endpoint}. Tentando refresh token...`);

                const refreshed = await this._handleRefreshToken();

                if (refreshed) {
                    console.log("Token renovado. Retentando requisição original...");
                    // Atualiza o header com o novo token
                    options.headers = { ...this._getHeaders(), ...options.headers };
                    response = await fetch(url, options);
                } else {
                    const { refreshToken } = SecureStorage.getTokens();
                    if (!refreshToken) {
                        console.warn("Modo Offline detectado (sem refresh token). Ignorando logout forçado.");
                        return { success: false, erro: "Modo Offline: Não foi possível sincronizar.", offline: true };
                    }

                    console.error("Falha no refresh. Deslogando usuário.");
                    await this._forceLogout();
                    return { success: false, erro: "Sessão expirada. Faça login novamente.", sessionExpired: true };
                }
            }

            return await this._tratarResposta(response);

        } catch (error) {
            console.error(`Erro na requisição ${endpoint}:`, error);
            // Verifica se é erro de rede
            if (error.cause && error.cause.code === 'ECONNREFUSED') {
                return { success: false, erro: "Servidor indisponível.", networkError: true, offline: true };
            }
            return { success: false, erro: "Erro de conexão.", networkError: true, offline: true };
        }
    }

    /**
     * Tenta usar o Refresh Token para pegar um novo Access Token
     * Implementa Pattern Singleton/Mutex para evitar condições de corrida
     */
    async _handleRefreshToken() {
        // Se já existe um refresh em andamento (GLOBAL), aguarda ele
        if (globalRefreshPromise) {
            console.log("Aguardando refresh token em andamento (Global)...");
            return globalRefreshPromise;
        }

        // Inicia novo refresh
        globalRefreshPromise = this._performRefresh();

        try {
            const resultado = await globalRefreshPromise;
            return resultado;
        } finally {
            // Limpa a promise global APENAS se fomos nós que criamos (ou sempre, já que acabou)
            // Mas cuidado: se limparmos muito cedo, outros que estão esperando podem se perder? 
            // Não, eles têm a referência da promise.
            // O importante é limpar para a PRÓXIMA vez.
            globalRefreshPromise = null;
        }
    }

    /**
     * Lógica real do refresh (chamada apenas uma vez por vez)
     */
    async _performRefresh() {
        const { refreshToken } = SecureStorage.getTokens();

        if (!refreshToken) {
            console.warn("Sem refresh token disponível.");
            return false;
        }

        try {
            console.log("Iniciando requisição de Refresh Token...");
            const response = await fetch(`${this.baseURL}desktop/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success' && data.data && data.data.token) {
                console.log("Refresh realizado com sucesso!");
                // Salva o novo Access Token (e Refresh se vier novo)
                // Se a API não retornar novo refresh, mantemos o antigo
                const newRefresh = data.data.refresh_token || refreshToken;
                SecureStorage.saveTokens(data.data.token, newRefresh);
                return true;
            } else {
                console.error("Erro na resposta do refresh:", data);
                return false;
            }
        } catch (error) {
            console.error("Erro durante refresh token:", error);
            return false;
        }
    }

    async _forceLogout() {
        SecureStorage.clearTokens();

        // Notifica todas as janelas para redirecionar para login
        // Precisamos garantir que isso seja enviado após a resposta chegar no front, 
        // mas via IPC events globais funciona bem.
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(win => win.webContents.send('auth:session-expired'));
    }

    async _tratarResposta(response) {
        const textoOriginal = await response.text();

        // Se a resposta for o erro específico "Token não fornecido", trata como 401 simulado
        // Isso ajuda se o PHP retornar 200 com status: error e mensagem de token
        if (textoOriginal.includes('Token não fornecido ou inválido')) {
            console.warn("API retornou erro de token no corpo da resposta.");
            return { success: false, erro: "Sessão inválida", sessionExpired: true };
        }

        try {
            const json = JSON.parse(textoOriginal);
            return json;
        } catch (e) {
            console.error("Resposta não-JSON:", textoOriginal);
            return {
                success: false,
                erro: "Erro no servidor (resposta inválida)."
            };
        }
    }
}

export default FetchAPI;
