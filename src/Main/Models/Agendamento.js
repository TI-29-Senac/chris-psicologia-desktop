import db from '../Database/db.js';

class Agendamento {
  
  adicionar(agendamento) {
    const stmt = db.prepare(
      `INSERT INTO agendamento (id_usuario, id_profissional, data_agendamento, status_consulta) 
       VALUES (?, ?, ?, ?)`
    );
    
    // Define 'pendente' como padrão se não vier nada
    const status = agendamento.status_consulta || 'pendente';

    const info = stmt.run(
        agendamento.id_usuario, 
        agendamento.id_profissional, 
        agendamento.data_agendamento, 
        status
    );
    
    return info.lastInsertRowid;
  }
    
  async listar() {
    // Aqui trazemos os dados crus. O JOIN para pegar os nomes é feito no Controller ou numa query específica.
    const stmt = db.prepare('SELECT * FROM agendamento WHERE excluido_em IS NULL ORDER BY data_agendamento DESC');
    return stmt.all();
  }

  async buscarPorId(id_agendamento){
    const stmt = db.prepare('SELECT * FROM agendamento WHERE id_agendamento = ? AND excluido_em IS NULL');
    return stmt.get(id_agendamento);
  }

  async atualizar(agendamentoAtualizado){
      const stmt = db.prepare(
        `UPDATE agendamento 
         SET id_usuario = ?, id_profissional = ?, data_agendamento = ?, status_consulta = ?, atualizado_em = CURRENT_TIMESTAMP 
         WHERE id_agendamento = ?`
      );

      const info = stmt.run(
          agendamentoAtualizado.id_usuario,
          agendamentoAtualizado.id_profissional,
          agendamentoAtualizado.data_agendamento,
          agendamentoAtualizado.status_consulta,
          agendamentoAtualizado.id_agendamento
      );
      return info.changes;
    }

  async remover(id_agendamento) {
    // Soft Delete (apenas marca como excluído)
    const stmt = db.prepare('UPDATE agendamento SET excluido_em = CURRENT_TIMESTAMP WHERE id_agendamento = ?');
    const info = stmt.run(id_agendamento);
    return info.changes > 0 ? true : false;
  }
}

export default Agendamento;