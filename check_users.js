import mysqlService from './src/Main/Service/MySQLService.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    console.log("Checando tabela usuario no MySQL remoto (IDs 18, 19, 20)...");
    try {
        const rows = await mysqlService.query('SELECT id_usuario, nome_usuario, email_usuario FROM usuario WHERE id_usuario IN (18, 19, 20, 10, 6, 7)');
        console.log(`Encontrados ${rows.length} registros.`);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error("Erro:", e);
    }
    process.exit();
}

check();
