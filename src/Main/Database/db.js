import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

let db = null;

export function initDatabase(dbSourcePath, dbTargetPath) {
    if (db) return db;

    const dbExists = fs.existsSync(dbTargetPath);

    if (!dbExists) {
        console.log(`[DB INIT] Banco não encontrado em ${dbTargetPath}. Copiando o arquivo fonte...`);
        try {
            const dir = path.dirname(dbTargetPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.copyFileSync(dbSourcePath, dbTargetPath);
            console.log("[DB INIT] Banco de dados copiado com sucesso.");
        } catch (error) {
            console.error("[DB INIT] Erro ao copiar o banco de dados:", error);
        }
    } else {
        console.log(`[DB INIT] Banco de dados encontrado em ${dbTargetPath}. Abrindo...`);
    }

    db = new Database(dbTargetPath);
    db.pragma('journal_mode = WAL');

    return db;
}

export default function getDb() {
    if (!db) {
        throw new Error("Banco de dados não inicializado. Chame initDatabase() em main.js.");
    }
    return db;
}