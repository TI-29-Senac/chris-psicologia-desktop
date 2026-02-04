import { app } from 'electron';
import path from 'path';
import fs from 'fs';

class SecureStorage {
    constructor() {
        this.userDataPath = app.getPath('userData');
        this.filePath = path.join(this.userDataPath, 'auth_tokens.json'); // Mudamos nome para indicar que é simples
    }

    /**
     * Salva os tokens em texto simples (JSON) para garantir persistência.
     * A criptografia nativa estava causando instabilidade no ambiente.
     */
    saveTokens(accessToken, refreshToken) {
        try {
            const data = JSON.stringify({ accessToken, refreshToken });
            fs.writeFileSync(this.filePath, data);
            return true;
        } catch (error) {
            console.error("Erro ao salvar tokens:", error);
            return false;
        }
    }

    /**
     * Recupera os tokens do arquivo JSON.
     */
    getTokens() {
        try {
            if (!fs.existsSync(this.filePath)) {
                return { accessToken: null, refreshToken: null };
            }

            const rawData = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error("Erro ao ler tokens:", error);
            return { accessToken: null, refreshToken: null };
        }
    }

    /**
     * Remove o arquivo de tokens (Logout).
     */
    clearTokens() {
        try {
            if (fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
                console.log("Tokens removidos.");
            }
        } catch (error) {
            console.error("Erro ao limpar tokens:", error);
        }
    }
}

export default new SecureStorage();
