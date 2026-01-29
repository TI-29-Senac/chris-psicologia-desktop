import FetchAPI from '../Service/FetchAPI.js';
// ALTERAÇÃO AQUI: Importe o 'db' (padrão) em vez de { configurarDB }
import db from '../Database/db.js'; 
import { v4 as uuidv4 } from 'uuid';

class UsuarioModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // Com better-sqlite3, usamos db.prepare().all() de forma síncrona
            const usuariosLocais = db.prepare('SELECT * FROM usuario WHERE excluido_em IS NULL').all();
            
            if (usuariosLocais.length > 0) {
                return usuariosLocais;
            }

            const resultado = await this.api.get('usuarios');
            return Array.isArray(resultado) ? resultado : (resultado.data || []);
        } catch (error) {
            console.error("Erro na Model Usuario (listar):", error);
            return [];
        }
    }

    async cadastrar(dados) {
        try {
            const novoId = uuidv4(); 
            
            // 1. Salva no SQLite (Better-sqlite3 usa .run())
            const stmt = db.prepare(`
                INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario, sincronizado) 
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(novoId, dados.nome, dados.email, dados.senha, dados.tipo, 0);

            // 2. Tenta enviar para o MySQL (API)
            try {
                const dadosParaAPI = { ...dados, id: novoId };
                const apiRes = await this.api.post('usuarios/salvar', dadosParaAPI);

                if (apiRes && apiRes.success) {
                    // Marca como sincronizado se a API aceitar
                    db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(novoId);
                    return { success: true, id: novoId, sincronizado: true };
                }
            } catch (apiError) {
                console.warn("API Offline. O registro ficou apenas no SQLite.");
            }

            return { success: true, id: novoId, sincronizado: false };
        } catch (error) {
            console.error("Erro no cadastro local:", error);
            return { success: false, erro: "Erro ao salvar no banco local." };
        }
    }

    // ... manter os outros métodos (editar, excluir) seguindo o padrão db.prepare().run()
}

export default UsuarioModel;