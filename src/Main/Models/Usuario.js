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
        const resAPI = await this.api.get('usuarios');
        const listaSite = Array.isArray(resAPI) ? resAPI : (resAPI.data || []);

        // Opcional: Limpar do SQLite local registros que já estão no site 
        // para manter o banco local leve e evitar conflitos de ID
        return listaSite; 
    } catch (error) {
        // Se estiver offline, mostra o que tem no SQLite (UUIDs ou IDs antigos)
        return db.prepare('SELECT * FROM usuario WHERE excluido_em IS NULL').all();
    }
}

    async cadastrar(dados) {
    try {
        const novoId = uuidv4(); 
        
        // 1. Salva no SQLite - Note o mapeamento correto das propriedades
        const stmt = db.prepare(`
            INSERT INTO usuario (
                id_usuario, 
                nome_usuario, 
                email_usuario, 
                senha_usuario, 
                tipo_usuario, 
                cpf,
                sincronizado
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        // MAPEAMENTO CORRETO: dados.nome_usuario (vindo do controller) -> coluna nome_usuario
        stmt.run(
            novoId, 
            dados.nome_usuario, 
            dados.email_usuario, 
            dados.senha_usuario, 
            dados.tipo_usuario, 
            dados.cpf || '000.000.000-00', 
            0
        );

        // 2. Tenta enviar para o MySQL (API)
        try {
            // Garante que o ID gerado vá para a API também
            const dadosParaAPI = { ...dados, id_usuario: novoId }; 
            const apiRes = await this.api.post('usuarios/salvar', dadosParaAPI);

            if (apiRes && apiRes.success) {
                db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(novoId);
                return { success: true, id: novoId, sincronizado: true };
            }
        } catch (apiError) {
            console.warn("API Offline. O registro ficou apenas no SQLite.");
        }

        return { success: true, id: novoId, sincronizado: false };
    } catch (error) {
        console.error("Erro no cadastro local:", error.message);
        return { success: false, erro: "Erro ao salvar no banco local: " + error.message };
    }
}

// src/Main/Models/Usuario.js

async editar(dados) {
    const stmt = db.prepare(`
        UPDATE usuario 
        SET nome_usuario = ?, 
            email_usuario = ?, 
            tipo_usuario = ?, -- Recebe: 'cliente', 'profissional', 'recepcionista' ou 'admin'
            cpf = ?, 
            sincronizado = 0, 
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id_usuario = ?
    `);
    
    stmt.run(
        dados.nome_usuario, 
        dados.email_usuario, 
        dados.tipo_usuario, 
        dados.cpf, 
        dados.id_usuario
    );

        // Tenta avisar o site da mudança
        try {
            await this.api.post('usuarios/salvar', dados);
            db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?')
              .run(dados.id_usuario);
        } catch (e) {
            console.warn("Mudança de tipo gravada apenas localmente.");
        }

        return { success: true };
    } catch (error) {
        return { success: false, erro: error.message };
    }


async excluir(id) {
    try {
        // 1. Remove do SQLite local imediatamente
        const stmt = db.prepare('DELETE FROM usuario WHERE id_usuario = ?');
        stmt.run(id);

        // 2. Tenta remover no site (MySQL)
        try {
            // Certifique-se de que a rota de exclusão no PHP aceite o ID enviado
            const res = await this.api.post(`usuarios/excluir/${id}`);
            return res;
        } catch (apiErr) {
            console.warn("Offline: Removido apenas localmente.");
            return { success: true, offline: true };
        }
    } catch (error) {
        console.error("Erro ao excluir:", error.message);
        return { success: false, erro: error.message };
    }
}

async sincronizacaoBidirecional() {
    try {
        // --- FLUXO 1: PUSH (Local -> Servidor) ---
        // Busca alterações locais (sincronizado = 0)
        const pendentesLocais = db.prepare('SELECT * FROM usuario WHERE sincronizado = 0').all();
        
        for (const user of pendentesLocais) {
            const res = await this.api.post('usuarios/salvar', user);
            if (res && res.success) {
                // Se o servidor gerou um ID novo (82), atualizamos o UUID local
                const novoId = res.id_gerado || user.id_usuario;
                db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?')
                  .run(novoId.toString(), user.id_usuario);
            }
        }

        // --- FLUXO 2: PULL (Servidor -> Local) ---
        // Busca todos os usuários do MySQL
        const usuariosSite = await this.api.get('usuarios');
        const listaOficial = Array.isArray(usuariosSite) ? usuariosSite : (usuariosSite.data || []);

        const stmtUpsert = db.prepare(`
            INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, sincronizado)
            VALUES (?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id_usuario) DO UPDATE SET
                nome_usuario = excluded.nome_usuario,
                email_usuario = excluded.email_usuario,
                tipo_usuario = excluded.tipo_usuario,
                cpf = excluded.cpf,
                sincronizado = 1
        `);

        const transacaoPull = db.transaction((dados) => {
            for (const u of dados) {
                stmtUpsert.run(
                    u.id_usuario.toString(),
                    u.nome_usuario,
                    u.email_usuario,
                    u.senha_usuario,
                    u.tipo_usuario,
                    u.cpf || '000.000.000-00'
                );
            }
        });

        transacaoPull(listaOficial);
        return { success: true, message: "Sincronização bidirecional concluída." };

    } catch (error) {
        console.error("Erro na sincronização bidirecional:", error);
        return { success: false, erro: error.message };
    }
}
}

export default UsuarioModel;