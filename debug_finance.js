const db = require('better-sqlite3')('clinica.db');

console.log("--- Pagamentos (Amostra) ---");
const rows = db.prepare("SELECT id_pagamento, valor, criado_em FROM pagamento LIMIT 5").all();
console.table(rows);

console.log("\n--- Contagem por Ano (Teste de strftime) ---");
try {
    const porAno = db.prepare("SELECT strftime('%Y', criado_em) as ano, count(*) as total FROM pagamento GROUP BY ano").all();
    console.table(porAno);
} catch (e) {
    console.error("Erro no strftime:", e.message);
}
