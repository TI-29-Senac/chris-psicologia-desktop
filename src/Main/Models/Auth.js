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

            console.log("Resposta do Login Online:", resultado);

            if (resultado && resultado.success) {
                // CACHE DE CREDENCIAL:
                // Se o login online funcionou, a senha está correta. 
                // Vamos salvar o hash dela no banco local para permitir login offline futuro.
                try {
                    const usuarioLocal = db.prepare('SELECT id_usuario FROM usuario WHERE email_usuario = ?').get(email);
                    if (usuarioLocal) {
                        const salt = bcrypt.genSaltSync(10);
                        const novoHash = bcrypt.hashSync(senha, salt);

                        db.prepare('UPDATE usuario SET senha_usuario = ? WHERE id_usuario = ?')
                            .run(novoHash, usuarioLocal.id_usuario);

                        console.log("Credencial de login cacheada com sucesso.");
                    }
                } catch (cacheErr) {
                    console.warn("Não foi possível atualizar o cache de senha local:", cacheErr);
                }

                return resultado;
            } else if (resultado && (resultado.erro || resultado.message)) {

                // SE FOR ERRO DE REDE, NÃO RETORNA! Deixa cair no catch/fluxo offline.
                if (resultado.networkError) {
                    throw new Error("Falha de rede detectada pelo FetchAPI.");
                }

                // Se a API retornou erro explícito (ex: senha inválida), não tentamos offline.
                // Retornamos o erro da API.
                const msgErro = resultado.erro || resultado.message;
                console.warn("Login recusado pela API:", msgErro);

                // Normaliza o retorno para o frontend
                return { success: false, erro: msgErro };
            }
        } catch (error) {
            console.warn("API Offline ou Erro de conexão. Tentando login local... Erro:", error);
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