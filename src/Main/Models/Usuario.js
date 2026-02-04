import FetchAPI from '../Service/FetchAPI.js';
// ALTERAÇÃO AQUI: Importe o 'db' (padrão) em vez de { configurarDB }
import db from '../Database/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

class UsuarioModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // OFFLINE-FIRST: Listar sempre do banco local para garantir velocidade e consistência
            // A sincronização de fundo cuida de atualizar esses dados.
            return db.prepare('SELECT * FROM usuario WHERE excluido_em IS NULL').all();
        } catch (error) {
            console.error("Erro ao listar usuários localmente:", error);
            return [];
        }
    }

    async cadastrar(dados) {
        try {
            const novoId = uuidv4();

            // 1. Salva no SQLite - Note o mapeamento correto das propriedades
            // UNIFICAÇÃO DE SENHA: Gera o hash localmente para permitir login offline imediato
            const salt = bcrypt.genSaltSync(10);
            const senhaHashLocal = bcrypt.hashSync(dados.senha_usuario, salt);

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
                senhaHashLocal, // Salva o hash, não a senha crua
                dados.tipo_usuario,
                dados.cpf || '000.000.000-00',
                0
            );

            // 2. Tenta enviar para o MySQL (API)
            try {
                // Garante que o ID gerado vá para a API também
                const dadosParaAPI = { ...dados, id_usuario: novoId };
                // REVERTIDO: APIUsuarioController espera JSON
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

    async editar(dados) {
        try {
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
                // REVERTIDO: API espera JSON
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
    }

    async excluir(id) {
        try {
            // 1. Remove do SQLite local imediatamente (Soft Delete preferido para sync, mas mantendo lógica original modificada para soft delete sync)
            // Alterado para Soft Delete local para permitir sync de exclusão
            const stmt = db.prepare('UPDATE usuario SET excluido_em = CURRENT_TIMESTAMP, sincronizado = 0 WHERE id_usuario = ?');
            stmt.run(id);

            // 2. Tenta remover no site (MySQL)
            try {
                // Certifique-se de que a rota de exclusão no PHP aceite o ID enviado
                const res = await this.api.post(`usuarios/excluir/${id}`);
                if (res && res.success) {
                    // Se confirmou exclusão lá, podemos excluir fisicamente aqui ou manter como excluido.
                    // Vamos manter soft delete sincronizado.
                    db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(id);
                }
                return res;
            } catch (apiErr) {
                console.warn("Offline: Removido apenas localmente (marcado para sync).");
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
                try {
                    // Se tiver excluido_em preenchido, manda excluir na API
                    if (user.excluido_em) {
                        try {
                            const res = await this.api.post(`usuarios/excluir/${user.id_usuario}`);

                            // SE A SESSÃO EXPIROU, PARE TUDO IMEDIATAMENTE
                            if (res && res.sessionExpired) {
                                return { success: false, erro: "Sessão expirada.", sessionExpired: true };
                            }

                            // SE ESTIVER OFFLINE, PARE TUDO PARA EVITAR FLOOD
                            if (res && res.offline) {
                                console.warn("Sincronização interrompida: Modo Offline.");
                                return { success: false, erro: "Modo Offline.", offline: true };
                            }

                            // Se sucesso (ou se já não existe), marcamos como sincronizado
                            if (res && (res.success || res.offline)) {
                                db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(user.id_usuario);
                                // Opcional: deletar fisicamente agora se quiser limpar o banco
                            }
                        } catch (e) {
                            console.warn(`Erro ao excluir usuário ${user.id_usuario} na API:`, e);
                        }
                    } else {
                        // Cadastro ou Edição
                        // REVERTIDO: API espera JSON
                        const res = await this.api.post('usuarios/salvar', user);

                        // SE A SESSÃO EXPIROU, PARE TUDO IMEDIATAMENTE
                        if (res && res.sessionExpired) {
                            console.error("Sincronização abortada: Sessão expirada.");
                            return { success: false, erro: "Sessão expirada.", sessionExpired: true };
                        }

                        // SE ESTIVER OFFLINE, PARE TUDO
                        if (res && res.offline) {
                            console.warn("Sincronização interrompida: Modo Offline.");
                            return { success: false, erro: "Modo Offline.", offline: true };
                        }

                        if (res && res.success) {
                            // Se o servidor gerou um ID novo e é diferente do local
                            const novoId = res.id_gerado || user.id_usuario;

                            // Atualiza ID local (Cascata do DB cuida das referências) e marca sync=1
                            if (novoId.toString() !== user.id_usuario.toString()) {
                                db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?')
                                    .run(novoId.toString(), user.id_usuario);
                            } else {
                                db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?')
                                    .run(user.id_usuario);
                            }
                        }
                    }
                } catch (errItem) {
                    console.error(`Erro ao sincronizar item ${user.id_usuario}:`, errItem);
                }
            }

            // --- FLUXO 2: PULL (Servidor -> Local) ---
            // Busca todos os usuários do MySQL
            const usuariosSite = await this.api.get('usuarios');

            if (usuariosSite && usuariosSite.sessionExpired) {
                return { success: false, erro: "Sessão expirada durante Pull.", sessionExpired: true };
            }

            if (usuariosSite && usuariosSite.offline) {
                return { success: false, erro: "Modo Offline durante Pull.", offline: true };
            }

            const listaOficial = Array.isArray(usuariosSite) ? usuariosSite : (usuariosSite.data || []);

            if (listaOficial.length > 0) {
                console.log("Exemplo de usuário vindo da API:", listaOficial[0]); // Debug
            }

            const stmtUpsert = db.prepare(`
                INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, sincronizado, excluido_em)
                VALUES (@id, @nome, @email, @senha, @tipo, @cpf, 1, NULL)
                ON CONFLICT(id_usuario) DO UPDATE SET
                    nome_usuario = excluded.nome_usuario,
                    email_usuario = excluded.email_usuario,
                    senha_usuario = excluded.senha_usuario,
                    tipo_usuario = excluded.tipo_usuario,
                    cpf = excluded.cpf,
                    sincronizado = 1,
                    excluido_em = NULL
            `);

            const checkEmailStmt = db.prepare('SELECT id_usuario FROM usuario WHERE email_usuario = ?');
            const checkIdStmt = db.prepare('SELECT id_usuario FROM usuario WHERE id_usuario = ?');
            const updateIdStmt = db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?');
            const deleteStmt = db.prepare('DELETE FROM usuario WHERE id_usuario = ?');

            const transacaoPull = db.transaction((dados) => {
                for (const u of dados) {
                    // 1. UNIFICAÇÃO: Verifica colisão de email (Local ID != Server ID)
                    // Busca quem tem esse email localmente
                    const local = checkEmailStmt.get(u.email_usuario);

                    if (local && local.id_usuario.toString() !== u.id_usuario.toString()) {
                        console.log(`Unificando usuário por email: Local(${local.id_usuario}) -> Server(${u.id_usuario})`);

                        try {
                            // Verifica se o ID de destino (Server ID) JÁ existe no banco (ocupado por outro usuário/stale)
                            const obstrucao = checkIdStmt.get(u.id_usuario.toString());
                            if (obstrucao) {
                                console.warn(`Conflito de ID detectado! Removendo registro obsoleto/conflitante ID ${u.id_usuario} para liberar espaço.`);
                                // Deletamos o registro que está ocupando o ID do servidor (Server Authority)
                                deleteStmt.run(u.id_usuario.toString());
                            }

                            // Agora o caminho está livre para renomear o ID local
                            updateIdStmt.run(u.id_usuario.toString(), local.id_usuario);
                        } catch (e) {
                            console.error("Erro crítico ao unificar IDs:", e.message);
                            // Se falhar aqui, o UPSERT abaixo provavelmente vai falhar por Email Unique
                        }
                    }

                    // 2. PREPARAÇÃO: Tratamento de Senha (Compatibilidade PHP -> Node)
                    // O PHP usa $2y$, o bcryptjs do Node prefere $2a$. São compatíveis, basta trocar o prefixo.
                    let senhaHash = '$2a$10$NotSyncedxxxxxxxxxxxxxxxxxxxxxx'; // Default

                    const senhaVindaDaApi = u.senha_usuario || u.senha;
                    if (senhaVindaDaApi) {
                        // Se parece ser um hash bcrypt (começa com $2)
                        if (senhaVindaDaApi.startsWith('$2')) {
                            senhaHash = senhaVindaDaApi.replace(/^\$2y\$/, '$2a$'); // Converte para formato do Node
                        } else {
                            // Se vier senha plana (não deveria, mas...), gera hash
                            // senhaHash = bcrypt.hashSync(senhaVindaDaApi, 10);
                            // Melhor não assumir senha plana na sync por segurança, mantém o hash se vier, ou placeholder.
                        }
                    }

                    // 3. UPSERT
                    stmtUpsert.run({
                        id: u.id_usuario.toString(),
                        nome: u.nome_usuario,
                        email: u.email_usuario,
                        senha: senhaHash,
                        tipo: u.tipo_usuario || u.tipo,
                        cpf: u.cpf || '000.000.000-00'
                    });
                }
            });

            if (listaOficial.length > 0) {
                transacaoPull(listaOficial);
            }

            return { success: true, message: "Sincronização bidirecional concluída." };

        } catch (error) {
            console.error("Erro na sincronização bidirecional:", error);
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioModel;