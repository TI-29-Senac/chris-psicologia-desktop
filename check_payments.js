import mysqlService from './src/Main/Service/MySQLService.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    console.log("Checando tabela pagamento no MySQL remoto...");
    try {
        const rows = await mysqlService.query('SELECT * FROM pagamento LIMIT 10');
        console.log(`Encontrados ${rows.length} registros.`);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error("Erro:", e);
    }
    process.exit();
}

check();
