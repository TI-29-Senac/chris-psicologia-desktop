// src/Main/Database/db.js
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'clinica.db');
const db = new Database(dbPath, { verbose: console.log });

export function initDatabase() {
    // 1. Tabela de Usuários (Base para todos)
    db.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT NOT NULL,
            cpf TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo_usuario TEXT NOT NULL -- 'cliente' ou 'profissional'
        );
    `);

    // 2. Tabela de Profissionais (Extensão)
    // ADICIONEI: especialidade e valor_consulta
    db.exec(`
        CREATE TABLE IF NOT EXISTS profissional (
            id_profissional INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            especialidade TEXT,
            valor_consulta REAL,
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
        );
    `);

    // 3. Tabela de Agendamentos
    db.exec(`
        CREATE TABLE IF NOT EXISTS agendamento (
            id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_profissional INTEGER NOT NULL,
            data_agendamento DATETIME NOT NULL,
            status_consulta TEXT DEFAULT 'Agendado',
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
            FOREIGN KEY(id_profissional) REFERENCES profissional(id_profissional)
        );
    `);

    console.log("Banco inicializado em:", dbPath);
}

export default db;