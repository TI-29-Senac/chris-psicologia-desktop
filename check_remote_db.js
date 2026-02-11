
import mysqlService from './src/Main/Service/MySQLService.js';

(async () => {
    try {
        console.log("Conectando ao banco remoto...");
        const pool = await mysqlService.getPool();

        console.log("Verificando tabela 'agendamento'...");
        const [cols] = await pool.execute("DESCRIBE agendamento");
        console.log(cols.map(c => `${c.Field} (${c.Type})`).join('\n'));

        process.exit(0);
    } catch (error) {
        console.error("Erro:", error);
        process.exit(1);
    }
})();
