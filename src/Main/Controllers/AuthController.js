import Usuarios from '../Models/Usuarios.js';
import bcrypt from 'bcryptjs';

class AuthController {
    constructor() {
        this.usuarioModel = new Usuarios();
    }

    async login(credenciais) {
        const { email, senha } = credenciais;

        if (!email || !senha) {
            return { sucesso: false, mensagem: "Preencha todos os campos." };
        }

        const usuario = this.usuarioModel.buscarPorEmail(email);

        if (!usuario) {
            return { sucesso: false, mensagem: "Usuário ou senha incorretos." };
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_usuario);

        if (!senhaValida) {
            return { sucesso: false, mensagem: "Usuário ou senha incorretos." };
        }

        delete usuario.senha_usuario;
        return { sucesso: true, usuario: usuario };
    }
}

export default AuthController;