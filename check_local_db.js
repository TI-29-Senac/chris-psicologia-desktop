
import Database from 'better-sqlite3';
const db = new Database('./clinica.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Local Tables:", tables.map(t => t.name));

const checkTable = (tableName) => {
    try {
        const info = db.prepare(`PRAGMA table_info(${tableName})`).all();
        console.log(`\nStructure of ${tableName}:`);
        console.log(info.map(c => `${c.name} (${c.type})`).join('\n'));
    } catch (e) {
        console.log(`Table ${tableName} not found.`);
    }
};

checkTable('pagamento');
