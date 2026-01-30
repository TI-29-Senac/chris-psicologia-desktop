import FetchAPI from '../Service/FetchAPI.js';
import db from '../Database/db.js';
import bcrypt from 'bcryptjs'; // Importe a biblioteca

class AuthModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async login(email, senha) {
        try {
            // 1. Tenta login online primeiro
            const resultado = await this.api.post('auth/login', { email, senha });
            if (resultado && resultado.success) return resultado;
        } catch (error) {
            console.warn("API Offline. Tentando login local...");
        }

        // 2. Login Offline com verificação de Hash
        try {
            // Busca o usuário apenas pelo email
            const usuarioLocal = db.prepare('SELECT * FROM usuario WHERE email_usuario = ?').get(email);
            
            if (usuarioLocal && usuarioLocal.senha_usuario) {
                // Compara a senha digitada com o hash do banco
                const senhaValida = await bcrypt.compare(senha, usuarioLocal.senha_usuario);
                
                if (senhaValida) {
                    return { success: true, usuario: usuarioLocal, offline: true };
                }
            }
        } catch (dbError) {
            console.error("Erro no SQLite:", dbError);
        }

        return { success: false, erro: "Credenciais inválidas ou sem conexão." };
    }
}
export default AuthModel;