import Database from 'better-sqlite3';
import path from 'path';

// Caminho fixo para o script de seed (rodando na raiz)
const dbPath = path.join(process.cwd(), 'clinica.db');

console.log("Conectando ao banco para SEED:", dbPath);
const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

export default db;
