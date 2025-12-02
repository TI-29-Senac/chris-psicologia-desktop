// src/Main/Database/db.js
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Define o caminho do banco (salva na pasta de dados do usuário para não perder ao fechar)
const dbPath = path.join(app.getPath('userData'), 'clinica.db');
const db = new Database(dbPath, { verbose: console.log });

export function initDatabase() {
    // 1. Cria Tabela de Usuários (Pacientes e Profissionais)
    db.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT NOT NULL,
            email TEXT,
            senha TEXT,
            tipo_usuario TEXT NOT NULL -- 'cliente' ou 'profissional'
        );
    `);

    // 2. Cria Tabela de Profissionais (Extensão do usuário)
    db.exec(`
        CREATE TABLE IF NOT EXISTS profissional (
            id_profissional INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            registro_profissional TEXT,
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
        );
    `);

    // 3. Cria Tabela de Agendamentos
    db.exec(`
        CREATE TABLE IF NOT EXISTS agendamento (
            id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL, -- O Paciente
            id_profissional INTEGER NOT NULL,
            data_agendamento DATETIME NOT NULL,
            status_consulta TEXT DEFAULT 'Agendado',
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
            FOREIGN KEY(id_profissional) REFERENCES profissional(id_profissional)
        );
    `);

    console.log("Banco de dados inicializado em:", dbPath);
    
    // CHAMA A FUNÇÃO DE POPULAR DADOS FALSOS
    seedDatabase();
}

// --- FUNÇÃO PARA CRIAR DADOS DE TESTE ---
function seedDatabase() {
    // Verifica se já existe algum usuário. Se tiver, não faz nada.
    const row = db.prepare('SELECT count(*) as count FROM usuario').get();
    
    if (row.count === 0) {
        console.log("--- POPULANDO BANCO DE DADOS COM DADOS DE TESTE ---");

        // 1. Criar Pacientes
        const insertUser = db.prepare("INSERT INTO usuario (nome_usuario, tipo_usuario) VALUES (?, ?)");
        
        insertUser.run('Maria da Silva', 'cliente');
        insertUser.run('João Souza', 'cliente');
        insertUser.run('Ana Pereira', 'cliente');

        // 2. Criar Profissionais (Precisa criar o Usuario antes, depois vincular na tabela profissional)
        
        // Dr. House
        const infoHouse = insertUser.run('Dr. Gregory House', 'profissional');
        const insertProf = db.prepare("INSERT INTO profissional (id_usuario, registro_profissional) VALUES (?, ?)");
        insertProf.run(infoHouse.lastInsertRowid, 'CRM-12345');

        // Dra. Grey
        const infoGrey = insertUser.run('Dra. Meredith Grey', 'profissional');
        insertProf.run(infoGrey.lastInsertRowid, 'CRM-67890');

        console.log("--- DADOS DE TESTE CRIADOS COM SUCESSO ---");
    }
}

export default db;