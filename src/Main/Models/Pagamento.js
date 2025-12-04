// src/Main/Models/Pagamento.js
// Exemplo simples, sem banco de dados por enquanto
class Pagamento {
  constructor({ id, valor, metodo, data }) {
    this.id = id;
    this.valor = valor;
    this.metodo = metodo; // 'credit' ou 'pix'
    this.data = data;
  }

  // Aqui entraria a lógica para salvar no banco, etc.
  save() {
    console.log(`Salvando pagamento de ${this.valor} via ${this.metodo}`);
    // Lógica de banco de dados (usando o db.js) viria aqui
  }
}

export default Pagamento;
