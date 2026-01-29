import FetchAPI from '../Service/FetchAPI.js';
import { configurarDB } from '../Database/db.js';
import { v4 as uuidv4 } from 'uuid';

class UsuarioModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            const db = await configurarDB();
            // Tenta buscar primeiro do banco local (Offline First)
            const usuariosLocais = await db.all('SELECT * FROM usuarios');
            
            if (usuariosLocais.length > 0) {
                return usuariosLocais;
            }

            // Se o local estiver vazio, busca na API para popular o banco
            const resultado = await this.api.get('usuarios');
            return Array.isArray(resultado) ? resultado : (resultado.data || []);
        } catch (error) {
            console.error("Erro na Model Usuario (listar):", error);
            return [];
        }
    }

    async cadastrar(dados) {
        try {
            const db = await configurarDB();
            // GERA O UUID AQUI - Garante unicidade entre desktop e web
            const novoId = uuidv4(); 
            
            // 1. Salva no SQLite Primeiro
            await db.run(
                'INSERT INTO usuarios (id, nome, email, senha, tipo, sincronizado) VALUES (?, ?, ?, ?, ?, ?)',
                [novoId, dados.nome, dados.email, dados.senha, dados.tipo, 0]
            );

            // 2. Tenta enviar para o MySQL (API)
            try {
                const dadosParaAPI = { ...dados, id: novoId };
                const apiRes = await this.api.post('usuarios/salvar', dadosParaAPI);

                if (apiRes && apiRes.success) {
                    // Se a API aceitou, marca como sincronizado
                    await db.run('UPDATE usuarios SET sincronizado = 1 WHERE id = ?', [novoId]);
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

    async editar(dados) {
        try {
            const db = await configurarDB();
            
            // Atualiza localmente
            await db.run(
                'UPDATE usuarios SET nome = ?, email = ?, tipo = ?, sincronizado = 0 WHERE id = ?',
                [dados.nome, dados.email, dados.tipo, dados.id]
            );

            // Tenta atualizar na API
            await this.api.post('usuarios/salvar', dados);
            
            return { success: true };
        } catch (error) {
            console.error("Erro na Model Usuario (editar):", error);
            return { success: false, erro: error.message };
        }
    }

    async excluir(id) {
        try {
            const db = await configurarDB();
            
            // Exclui localmente
            await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
            
            // Tenta excluir na API
            return await this.api.post(`usuarios/excluir/${id}`);
        } catch (error) {
            console.error("Erro na Model Usuario (excluir):", error);
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioModel;