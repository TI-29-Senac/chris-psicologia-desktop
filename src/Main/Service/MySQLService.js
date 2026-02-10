
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class MySQLService {
    constructor() {
        this.pool = null;
    }

    async getPool() {
        if (!this.pool) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                dateStrings: true // Para receber datas como string 'YYYY-MM-DD HH:mm:ss'
            });
            console.log(`Conectando ao MySQL ${process.env.DB_HOST}...`);
        }
        return this.pool;
    }

    async query(sql, params) {
        try {
            const pool = await this.getPool();
            const [rows, fields] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error("Erro MySQL Query:", error.message);
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

// Singleton
const mysqlService = new MySQLService();
export default mysqlService;
