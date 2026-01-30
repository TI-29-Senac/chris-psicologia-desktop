import db from './src/Main/Database/db_seed.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedAdmin() {
    console.log("Criando usuário admin local...");

    const email = 'admin@teste.com';
    const senha = '123';

    // Gera hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    try {
        const id = uuidv4();

        db.prepare(`
            INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, sincronizado)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `).run(id, 'Admin Local', email, senhaHash, 'admin', '000.000.000-00');

        console.log(`\nSUCESSO! Usuário criado:\nEmail: ${email}\nSenha: ${senha}\n`);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log("\nUsuário admin já existe. Tente logar com: admin@teste.com / 123");
        } else {
            console.error("Erro ao criar usuário:", error);
        }
    }
}

seedAdmin();
