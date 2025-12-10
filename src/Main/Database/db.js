import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Define o caminho do banco. Prioriza a raiz em desenvolvimento para facilitar.
const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev 
    ? path.join(process.cwd(), 'clinica.db') 
    : path.join(app.getPath('userData'), 'clinica.db');

const db = new Database(dbPath, { verbose: console.log });

// Ativa chaves estrangeiras para garantir integridade
db.pragma('foreign_keys = ON');

export function initDatabase() {
    // Apenas garante que as tabelas essenciais para o offline existam.
    // Como você já tem o banco criado, esses comandos só rodarão se faltar algo.
    
    // Usuário
    db.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT NOT NULL,
            cpf TEXT NOT NULL DEFAULT '000.000.000-00',
            email_usuario TEXT NOT NULL UNIQUE,
            senha_usuario TEXT NOT NULL,
            tipo_usuario TEXT NOT NULL,
            status_usuario TEXT DEFAULT 'ativo',
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            excluido_em TEXT DEFAULT NULL
        );
    `);

    // Profissional
    db.exec(`
        CREATE TABLE IF NOT EXISTS profissional (
            id_profissional INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            especialidade TEXT NOT NULL,
            valor_consulta REAL NOT NULL,
            sinal_consulta REAL DEFAULT 0,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            excluido_em TEXT DEFAULT NULL,
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
        );
    `);

    // Agendamento
    db.exec(`
        CREATE TABLE IF NOT EXISTS agendamento (
            id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_profissional INTEGER NOT NULL,
            data_agendamento TEXT NOT NULL,
            status_consulta TEXT DEFAULT 'Agendado',
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            excluido_em TEXT DEFAULT NULL,
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
            FOREIGN KEY(id_profissional) REFERENCES profissional(id_profissional)
        );
    `);

    // Pagamento
    db.exec(`
        CREATE TABLE IF NOT EXISTS pagamento (
            id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
            id_agendamento INTEGER NOT NULL,
            id_forma_pagamento INTEGER NOT NULL,
            valor REAL, -- Adicionado para facilitar histórico sem join complexo
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            excluido_em TEXT DEFAULT NULL,
            FOREIGN KEY(id_agendamento) REFERENCES agendamento(id_agendamento)
        );
    `);

    // Formas de Pagamento (Garante que existam as básicas)
    const count = db.prepare('SELECT count(*) as total FROM formas_pagamento').get();
    if (count && count.total === 0) {
        const insertForma = db.prepare('INSERT INTO formas_pagamento (nome_forma_pagamento) VALUES (?)');
        insertForma.run('Dinheiro');
        insertForma.run('Pix');
        insertForma.run('Cartão de Crédito');
        insertForma.run('Cartão de Débito');
    }

    console.log("Banco de dados conectado:", dbPath);
}

export default db;