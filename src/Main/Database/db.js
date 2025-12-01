import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';

// Define o caminho. Mantive a lógica que usamos antes para funcionar em DEV (na pasta do projeto),
// mas você pode usar app.getPath('userData') se quiser seguir estritamente o professor.
const isDev = !app.isPackaged;
const dbPath = isDev 
  ? path.join(process.cwd(), 'clinica.db') 
  : path.join(process.resourcesPath, 'clinica.db');

const db = new Database(dbPath, { verbose: console.log });

export function initDatabase() {
  // Configurações de performance e integridade
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON'); // OBRIGATÓRIO para o SQLite respeitar os relacionamentos

  // Criação da tabela Agendamento (Baseada no nosso esquema convertido do MySQL)
  db.exec(`
    CREATE TABLE IF NOT EXISTS agendamento (
      id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,       -- FK para o Paciente
      id_profissional INTEGER NOT NULL,  -- FK para o Profissional
      data_agendamento TEXT NOT NULL,
      status_consulta TEXT DEFAULT 'pendente',
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      excluido_em TEXT DEFAULT NULL,
      
      -- Relacionamentos
      FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
      FOREIGN KEY (id_profissional) REFERENCES profissional (id_profissional)
    );
  `);
  
  console.log('Banco de dados inicializado e tabela agendamento verificada em:', dbPath);
}

export default db;