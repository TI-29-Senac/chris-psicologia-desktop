
import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

console.log('--- Agendamentos ---');
const agendamentos = db.prepare('SELECT * FROM agendamento').all();
console.log(`Total: ${agendamentos.length}`);
agendamentos.forEach(a => {
    console.log(`${a.id_agendamento} | User: ${a.id_usuario} | Prof: ${a.id_profissional} | Status: ${a.status_consulta} | Excluido: ${a.excluido_em}`);
});

console.log('\n--- Usuarios (Profissionais) ---');
const profs = db.prepare("SELECT * FROM usuario WHERE tipo_usuario = 'profissional'").all();
console.log(`Total Profissionais: ${profs.length}`);
profs.forEach(p => console.log(`${p.id_usuario} | ${p.nome_usuario}`));

console.log('\n--- Tabela Profissional ---');
try {
    const profTable = db.prepare("SELECT * FROM profissional").all();
    console.log(`Total Tabela Profissional: ${profTable.length}`);
    profTable.forEach(p => console.log(`ProfId: ${p.id_profissional} | UserId: ${p.id_usuario}`));
} catch (e) {
    console.log("Tabela profissional não existe ou erro:", e.message);
}
