// Remova: import Usuarios from '../Models/Usuarios.js';
// Remova: import bcrypt from 'bcryptjs';

class AuthController {
    constructor() {
        // A URL do seu backend remoto
        this.apiUrl = "https://localhost:8080/api/login"; 
    }

    async login(credenciais) {
        const { email, senha } = credenciais;

        if (!email || !senha) {
            return { sucesso: false, mensagem: "Preencha todos os campos." };
        }

        try {
            // Envia os dados para o seu backend PHP
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            // O backend deve retornar algo como { "sucesso": true, "usuario": { ... } }
            if (response.ok && data.sucesso) {
                return { sucesso: true, usuario: data.usuario };
            } else {
                return { sucesso: false, mensagem: data.mensagem || "Erro ao fazer login." };
            }

        } catch (error) {
            console.error("Erro de conexão:", error);
            return { sucesso: false, mensagem: "Erro ao conectar com o servidor." };
        }
    }
}

export default AuthController;