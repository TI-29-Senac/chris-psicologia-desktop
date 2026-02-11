import mysqlService from './src/Main/Service/MySQLService.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    console.log("Checando tabela agendamento no MySQL remoto (IDs 31, 33, 34)...");
    try {
        const rows = await mysqlService.query('SELECT * FROM agendamento WHERE id_agendamento IN (31, 33, 34, 35, 36)');
        console.log(`Encontrados ${rows.length} registros.`);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error("Erro:", e);
    }
    process.exit();
}

check();
