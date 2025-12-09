class User {
  constructor({ id, nome, email, senha, tipo }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.tipo = tipo; // admin, psicólogo, secretaria
  }
 
  save() {
    console.log(`Salvando usuário ${this.nome}`);
  }
}
 
export default User;