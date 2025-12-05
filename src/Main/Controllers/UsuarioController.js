import db from "../Database/db.js";
 
const UserController = {
  async listarUsuarios() {
    try {
      const [rows] = await db.query("SELECT * FROM usuarios ORDER BY id DESC");
 
      return { success: true, data: rows };
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return { success: false, message: "Erro ao buscar usuários" };
    }
  },
 
  async criarUsuario(nome, email, senha, tipo) {
    try {
      const [result] = await db.query(
        "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
        [nome, email, senha, tipo]
      );
 
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return { success: false, message: "Erro ao criar usuário" };
    }
  },
 
  async atualizarUsuario(id, nome, email, tipo) {
    try {
      await db.query(
        "UPDATE usuarios SET nome = ?, email = ?, tipo = ? WHERE id = ?",
        [nome, email, tipo, id]
      );
 
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return { success: false, message: "Erro ao atualizar usuário" };
    }
  },
 
  async excluirUsuario(id) {
    try {
      await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
 
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return { success: false, message: "Erro ao excluir usuário" };
    }
  }
};
 
export default UserController;