import getDb from '../Database/db.js';

class Usuarios {
  constructor() {}

  buscarPorEmail(email) {
    const db = getDb();
    
    const stmt = db.prepare(`
      SELECT * FROM usuario 
      WHERE email_usuario = ? AND status_usuario = 'ativo' AND excluido_em IS NULL
    `);
    return stmt.get(email);
  }
}

export default Usuarios;