import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// 1. Definição do Caminho do Banco
const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev
    ? path.join(process.cwd(), 'clinica.db')
    : path.join(app.getPath('userData'), 'clinica.db');

// 2. Instância do Banco (Síncrono)
const db = new Database(dbPath, { verbose: console.log });

// 3. Configurações de Integridade
db.pragma('foreign_keys = ON');

export function initDatabase() {
    console.log("Iniciando tabelas no banco:", dbPath);

    // Usamos transação para garantir que tudo seja criado corretamente
    const createTables = db.transaction(() => {

        // Tabela de Usuário (ID como TEXT para UUID)
        db.prepare(`
            CREATE TABLE IF NOT EXISTS usuario (
                id_usuario TEXT PRIMARY KEY, 
                nome_usuario TEXT NOT NULL,
                cpf TEXT NOT NULL DEFAULT '000.000.000-00',
                email_usuario TEXT NOT NULL UNIQUE,
                senha_usuario TEXT NOT NULL,
                tipo_usuario TEXT NOT NULL,
                status_usuario TEXT DEFAULT 'ativo',
                sincronizado INTEGER DEFAULT 0, 
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                excluido_em TEXT DEFAULT NULL
            )
        `).run();

        // Tabela de Profissional
        db.prepare(`
            CREATE TABLE IF NOT EXISTS profissional (
                id_profissional TEXT PRIMARY KEY,
                id_usuario TEXT NOT NULL,
                especialidade TEXT NOT NULL,
                valor_consulta REAL NOT NULL,
                sinal_consulta REAL DEFAULT 0,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                excluido_em TEXT DEFAULT NULL,
                FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `).run();

        // Tabela de Agendamento
        db.prepare(`
            CREATE TABLE IF NOT EXISTS agendamento (
                id_agendamento TEXT PRIMARY KEY,
                id_usuario TEXT NOT NULL,
                id_profissional TEXT NOT NULL,
                data_agendamento TEXT NOT NULL,
                status_consulta TEXT DEFAULT 'Agendado',
                observacoes TEXT,
                sincronizado INTEGER DEFAULT 0,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                excluido_em TEXT DEFAULT NULL,
                FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
                FOREIGN KEY(id_profissional) REFERENCES usuario(id_usuario)
            )
        `).run();

        // Tabela de Formas de Pagamento
        db.prepare(`
            CREATE TABLE IF NOT EXISTS formas_pagamento (
                id_forma_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_forma_pagamento TEXT NOT NULL
            )
        `).run();

        // Tabela de Pagamento
        db.prepare(`
            CREATE TABLE IF NOT EXISTS pagamento (
                id_pagamento TEXT PRIMARY KEY,
                id_agendamento TEXT NOT NULL,
                id_forma_pagamento INTEGER NOT NULL,
                valor REAL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                excluido_em TEXT DEFAULT NULL,
                FOREIGN KEY(id_forma_pagamento) REFERENCES formas_pagamento(id_forma_pagamento)
            )
        `).run();
    });

    createTables();

    // 3.1 Migração: Colunas de financeiro em agendamento
    try {
        db.prepare("ALTER TABLE agendamento ADD COLUMN valor_agendamento REAL DEFAULT 0").run();
        console.log("Coluna 'valor_agendamento' adicionada.");
    } catch (e) { /* Coluna já existe */ }

    try {
        db.prepare("ALTER TABLE agendamento ADD COLUMN status_pagamento TEXT DEFAULT 'pendente'").run();
        console.log("Coluna 'status_pagamento' adicionada.");
    } catch (e) { /* Coluna já existe */ }

    // 3.2 Migração: Coluna atualizado_em em pagamento (Fix erro sync)
    try {
        db.prepare("ALTER TABLE pagamento ADD COLUMN atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP").run();
        console.log("Coluna 'atualizado_em' adicionada em 'pagamento'.");
    } catch (e) { /* Coluna já existe */ }


    // 4. Inserção de Dados Iniciais (Seed)
    const count = db.prepare('SELECT count(*) as total FROM formas_pagamento').get();
    if (count && count.total === 0) {
        const insertForma = db.prepare('INSERT INTO formas_pagamento (nome_forma_pagamento) VALUES (?)');
        ['Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito'].forEach(forma => {
            insertForma.run(forma);
        });
    }

    // 5. Seed Admin (Garante acesso inicial)
    const adminExist = db.prepare("SELECT id_usuario FROM usuario WHERE email_usuario = 'admin@teste.com'").get();
    if (!adminExist) {
        console.log("Criando usuário ADMIN padrão...");
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('123', salt);

        db.prepare(`
            INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, sincronizado)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `).run(uuidv4(), 'Admin Local', 'admin@teste.com', hash, 'admin', '000.000.000-00');
    }

    console.log("Banco de dados conectado e tabelas prontas.");
}

export default db;