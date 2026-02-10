import db from '../Database/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import mysqlService from '../Service/MySQLService.js';

class UsuarioModel {
    constructor() {
        this.api = null; // Deprecated for sync
        this.mysql = mysqlService;
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
            // 0. Verifica se o e-mail já existe (Ativo ou Excluído)
            const emailNormalizado = dados.email_usuario.trim().toLowerCase();
            const usuarioExistente = db.prepare('SELECT * FROM usuario WHERE LOWER(email_usuario) = ?').get(emailNormalizado);

            // 0.1 Verifica se o CPF já existe
            if (dados.cpf && dados.cpf !== '000.000.000-00') {
                const cpfExistente = db.prepare('SELECT id_usuario FROM usuario WHERE cpf = ? AND excluido_em IS NULL').get(dados.cpf);
                if (cpfExistente) {
                    return { success: false, erro: "CPF já cadastrado." };
                }
            }

            if (usuarioExistente) {
                if (!usuarioExistente.excluido_em) {
                    // Cenário A: Usuário existe e está ativo
                    return { success: false, erro: "E-mail já cadastrado." };
                } else {
                    // Cenário B: Usuário existe mas está 'excluído' (Soft Delete) -> REATIVAR
                    console.log(`Reativando usuário excluído: ${usuarioExistente.id_usuario}`);

                    const salt = bcrypt.genSaltSync(10);
                    const senhaHashLocal = bcrypt.hashSync(dados.senha_usuario, salt);

                    db.prepare(`
                        UPDATE usuario 
                        SET nome_usuario = ?, 
                            email_usuario = ?,
                            senha_usuario = ?, 
                            tipo_usuario = ?, 
                            cpf = ?, 
                            sincronizado = 0, 
                            excluido_em = NULL,
                            atualizado_em = CURRENT_TIMESTAMP
                        WHERE id_usuario = ?
                    `).run(
                        dados.nome_usuario,
                        emailNormalizado, // Garante update com o email novo (embora deva ser igual)
                        senhaHashLocal,
                        dados.tipo_usuario,
                        dados.cpf || '000.000.000-00',
                        usuarioExistente.id_usuario
                    );

                    // Tenta avisar API (Upsert)
                    try {
                        const dadosReativacao = { ...dados, email_usuario: emailNormalizado, id_usuario: usuarioExistente.id_usuario };
                        await this.api.post('usuarios/salvar', dadosReativacao);
                        db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(usuarioExistente.id_usuario);
                    } catch (e) {
                        console.warn("Reativação feita apenas localmente (API Offline).");
                    }

                    return { success: true, id: usuarioExistente.id_usuario, reativado: true };
                }
            }

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
                emailNormalizado,
                senhaHashLocal, // Salva o hash, não a senha crua
                dados.tipo_usuario,
                dados.cpf || '000.000.000-00',
                0
            );

            // 1.1 Se for Profissional, salva na tabela de detalhes
            if (dados.tipo_usuario === 'profissional') {
                db.prepare(`
                    INSERT INTO profissional (id_profissional, id_usuario, especialidade, valor_consulta, sinal_consulta)
                    VALUES (?, ?, ?, ?, ?)
                `).run(
                    uuidv4(),
                    novoId,
                    dados.especialidade || 'Clínica Geral',
                    dados.valor_consulta || 0,
                    dados.sinal_consulta || 0
                );
            }

            // 2. Tenta enviar para o MySQL (API)
            try {
                // Garante que o ID gerado vá para a API também
                const dadosParaAPI = { ...dados, id_usuario: novoId };

                // FIX: Adiciona 'id' como alias para evitar problemas no backend
                dadosParaAPI.id = novoId;

                const apiRes = await this.api.post('usuarios/salvar', dadosParaAPI);

                if (apiRes && apiRes.success) {
                    // FIX CRÍTICO: Se o servidor retornou um ID novo (sequencial/int), PRECISAS ATUALIZAR O LOCAL
                    // Se não fizermos isso, o local fica com UUID e o server com ID 10, causando duplicidade na próxima edição.

                    const idServidor = apiRes.id_gerado || apiRes.id || apiRes.data?.id;

                    if (idServidor && idServidor.toString() !== novoId.toString()) {
                        console.log(`Atualizando ID Local (Cadastro): UUID(${novoId}) -> Server(${idServidor})`);
                        db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?')
                            .run(idServidor.toString(), novoId);

                        // Atualiza também referências na tabela Profissional (Cascade geralmente cuida, mas por segurança...)
                        // SQLite com FK correta faz cascade. Se não, precisaríamos update manual. 
                        // Assumindo Cascade ou update pelo ID antigo acima (se FK on update cascade).

                        return { success: true, id: idServidor, sincronizado: true };
                    } else {
                        db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(novoId);
                        return { success: true, id: novoId, sincronizado: true };
                    }
                }
            } catch (apiError) {
                console.warn("API Offline. O registro ficou apenas no SQLite.", apiError);
            }

            return { success: true, id: novoId, sincronizado: false };
        } catch (error) {
            console.error("Erro no cadastro local:", error.message);
            return { success: false, erro: "Erro ao salvar no banco local: " + error.message };
        }
    }

    async editar(dados) {
        try {
            // VERIFICAÇÃO DE DUPLICIDADE DE CPF NA EDIÇÃO
            if (dados.cpf && dados.cpf !== '000.000.000-00') {
                const cpfExistente = db.prepare('SELECT id_usuario FROM usuario WHERE cpf = ? AND id_usuario != ? AND excluido_em IS NULL').get(dados.cpf, dados.id_usuario);
                if (cpfExistente) {
                    return { success: false, erro: "CPF já cadastrado para outro usuário." };
                }
            }

            // LÓGICA DE SENHA: Só atualiza se o usuário digitou algo
            let atualizarSenha = false;
            let senhaHashLocal = null;

            if (dados.senha_usuario && dados.senha_usuario.trim() !== '') {
                atualizarSenha = true;
                const salt = bcrypt.genSaltSync(10);
                senhaHashLocal = bcrypt.hashSync(dados.senha_usuario, salt);
            }

            if (atualizarSenha) {
                // UPDATE COM SENHA
                db.prepare(`
                    UPDATE usuario 
                    SET nome_usuario = ?, 
                        email_usuario = ?, 
                        tipo_usuario = ?, 
                        cpf = ?, 
                        senha_usuario = ?,
                        sincronizado = 0, 
                        atualizado_em = CURRENT_TIMESTAMP
                    WHERE id_usuario = ?
                `).run(
                    dados.nome_usuario,
                    dados.email_usuario,
                    dados.tipo_usuario,
                    dados.cpf,
                    senhaHashLocal,
                    dados.id_usuario
                );
            } else {
                // UPDATE SEM SENHA (MANTÉM A ANTIGA)
                db.prepare(`
                    UPDATE usuario 
                    SET nome_usuario = ?, 
                        email_usuario = ?, 
                        tipo_usuario = ?, 
                        cpf = ?, 
                        sincronizado = 0, 
                        atualizado_em = CURRENT_TIMESTAMP
                    WHERE id_usuario = ?
                `).run(
                    dados.nome_usuario,
                    dados.email_usuario,
                    dados.tipo_usuario,
                    dados.cpf,
                    dados.id_usuario
                );
            }

            // ATUALIZAÇÃO DA TABELA PROFISSIONAL
            if (dados.tipo_usuario === 'profissional') {
                const profExistente = db.prepare('SELECT id_profissional FROM profissional WHERE id_usuario = ?').get(dados.id_usuario);

                if (profExistente) {
                    db.prepare(`
                        UPDATE profissional 
                        SET especialidade = ?, 
                            valor_consulta = ?, 
                            sinal_consulta = ?
                        WHERE id_usuario = ?
                    `).run(
                        dados.especialidade,
                        dados.valor_consulta,
                        dados.sinal_consulta,
                        dados.id_usuario
                    );
                } else {
                    // Caso o usuário tenha virado profissional agora
                    db.prepare(`
                        INSERT INTO profissional (id_profissional, id_usuario, especialidade, valor_consulta, sinal_consulta)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(
                        uuidv4(),
                        dados.id_usuario,
                        dados.especialidade || '',
                        dados.valor_consulta || 0,
                        dados.sinal_consulta || 0
                    );
                }
            }

            // Tenta avisar o site da mudança
            try {
                // AUTO-CORREÇÃO DE ID (UUID -> Server ID) ANTES DA EDIÇÃO
                let idParaEnvio = dados.id_usuario;

                if (idParaEnvio && idParaEnvio.toString().length > 10) {
                    console.log("ID Local parece ser UUID. Buscando correspondência no servidor antes de editar...");
                    try {
                        const usersRemotos = await this.api.get('usuarios');
                        if (usersRemotos && Array.isArray(usersRemotos.data || usersRemotos)) {
                            const lista = usersRemotos.data || usersRemotos;
                            const emailAlvo = dados.email_usuario.toLowerCase();
                            const match = lista.find(u => u.email_usuario && u.email_usuario.toLowerCase() === emailAlvo);

                            if (match && match.id_usuario && match.id_usuario.toString() !== idParaEnvio.toString()) {
                                console.log(`Correspondência encontrada! Atualizando ID Local: ${idParaEnvio} -> ${match.id_usuario}`);

                                // Atualiza BD Local
                                db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 0 WHERE id_usuario = ?')
                                    .run(match.id_usuario.toString(), idParaEnvio);

                                idParaEnvio = match.id_usuario;
                                dados.id_usuario = match.id_usuario;
                            }
                        }
                    } catch (errBusca) {
                        console.warn("Falha na busca pré-edição:", errBusca);
                    }
                }

                // PREPARA PAYLOAD LIMPO PARA API
                const dadosParaAPI = { ...dados };

                // Usa o ID (possivelmente corrigido)
                dadosParaAPI.id_usuario = idParaEnvio;
                dadosParaAPI.id = idParaEnvio; // Alias

                // Se a senha estiver vazia, removemos do objeto para não apagar a senha no servidor
                if (!dados.senha_usuario || dados.senha_usuario.trim() === '') {
                    delete dadosParaAPI.senha_usuario;
                }

                console.log("Tentando editar na API (Payload Ajustado):", dadosParaAPI); // DEBUG
                const apiRes = await this.api.post('usuarios/salvar', dadosParaAPI);
                console.log("Resposta da API (Edição):", apiRes); // DEBUG

                if (apiRes && apiRes.success) {
                    // FIX: Se o servidor retornou um ID diferente do nosso (ex: corrigindo UUID -> Int), aceitamos.
                    const idServidor = apiRes.id_gerado || apiRes.id || apiRes.data?.id;

                    if (idServidor && idServidor.toString() !== idParaEnvio.toString()) {
                        console.log(`Atualizando ID Local (Edição - Resposta): ${idParaEnvio} -> ${idServidor}`);
                        db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?')
                            .run(idServidor.toString(), idParaEnvio);
                    } else {
                        db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?')
                            .run(idParaEnvio);
                    }
                } else {
                    console.warn("API retornou erro ou insucesso na edição:", apiRes); // DEBUG
                }
            } catch (e) {
                console.warn("Mudança de edição gravada apenas localmente (Offline ou Erro API).", e);
            }

            return { success: true };
        } catch (error) {
            console.error("Erro ao editar usuário:", error);
            return { success: false, erro: error.message };
        }
    }

    async excluir(id) {
        try {
            // 1. Remove do SQLite local imediatamente (Update Soft Delete)
            const stmt = db.prepare('UPDATE usuario SET excluido_em = CURRENT_TIMESTAMP, sincronizado = 0 WHERE id_usuario = ?');
            stmt.run(id);

            // 2. Busca o usuário atualizado para enviar o timestamp correto
            const usuarioAtualizado = db.prepare('SELECT * FROM usuario WHERE id_usuario = ?').get(id);

            // 3. Tenta salvar a atualização (Soft Delete) no site (MySQL)
            // OFFLINE-FIRST: Não retornamos erro se a API falhar, pois a exclusão local foi sucesso.
            try {
                // ALTERADO: Usamos 'salvar' em vez de 'excluir' para garantir que o campo excluido_em seja atualizado lá
                const res = await this.api.post('usuarios/salvar', usuarioAtualizado);

                if (res && res.success) {
                    db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(id);
                }
            } catch (apiErr) {
                console.warn("Offline: Removido apenas localmente (marcado para sync).");
            }

            // Sempre retorna sucesso se rodou o update local
            return { success: true };
        } catch (error) {
            console.error("Erro ao excluir:", error.message);
            return { success: false, erro: error.message };
        }
    }

    async sincronizacaoBidirecional() {
        try {
            console.log("Iniciando Sincronização Direta de Usuários (MySQL)...");

            // --- FLUXO 1: PUSH (Local -> Servidor) ---
            const pendentesLocais = db.prepare('SELECT * FROM usuario WHERE sincronizado = 0').all();

            for (const user of pendentesLocais) {
                try {
                    const isUuid = user.id_usuario.toString().length > 15;

                    if (user.excluido_em) {
                        try {
                            if (!isUuid) {
                                await this.mysql.query(
                                    'UPDATE usuario SET excluido_em = NOW() WHERE id_usuario = ?',
                                    [user.id_usuario]
                                );
                            }
                            db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(user.id_usuario);
                        } catch (e) {
                            console.warn(`Erro sync exclusão usuario ${user.id_usuario}:`, e.message);
                        }
                    } else {
                        // Cadastro ou Edição
                        if (isUuid) {
                            // INSERT
                            // Senha: Se for hash local ($2a), mantemos ou tentamos 'un-hash'? 
                            // O server espera hash BCrypt ($2y ou $2a). 
                            // O ideal é enviar o hash.
                            const res = await this.mysql.query(
                                `INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, status_usuario)
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [user.nome_usuario, user.email_usuario, user.senha_usuario, user.tipo_usuario, user.cpf, 'ativo']
                            );

                            const newId = res.insertId;
                            if (newId) {
                                console.log(`Sync Usuario: UUID(${user.id_usuario}) -> MySQL(${newId})`);
                                db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?')
                                    .run(newId.toString(), user.id_usuario);

                                // ATUALIZA REFERÊNCIAS NA TABELA DE AGENDAMENTOS E PROFISISONAL
                                // SQLite ON UPDATE CASCADE deve cuidar disso se FKs estiverem OK.
                                // Caso contrário, precisariamos scripts manuais.
                            }
                        } else {
                            // UPDATE
                            await this.mysql.query(
                                `UPDATE usuario SET 
                                    nome_usuario = ?, email_usuario = ?, tipo_usuario = ?, cpf = ?
                                    ${user.senha_usuario ? ', senha_usuario = ?' : ''}
                                 WHERE id_usuario = ?`,
                                user.senha_usuario
                                    ? [user.nome_usuario, user.email_usuario, user.tipo_usuario, user.cpf, user.senha_usuario, user.id_usuario]
                                    : [user.nome_usuario, user.email_usuario, user.tipo_usuario, user.cpf, user.id_usuario]
                            );
                            db.prepare('UPDATE usuario SET sincronizado = 1 WHERE id_usuario = ?').run(user.id_usuario);
                        }
                    }
                } catch (errItem) {
                    console.error(`Erro sync usuario ${user.id_usuario}:`, errItem.message);
                }
            }

            // --- FLUXO 2: PULL (Servidor -> Local) ---
            const usuariosSite = await this.mysql.query('SELECT * FROM usuario');
            // Busca também profissionais para popular a tabela 'profissional' local, se existir no remoto
            // Assumindo existência de tabela 'profissional' no remoto.
            let profissionaisSite = [];
            try {
                profissionaisSite = await this.mysql.query('SELECT * FROM profissional');
            } catch (e) { console.warn("Tabela profissional remota não encontrada ou erro:", e.message); }


            const stmtUpsert = db.prepare(`
                INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, sincronizado, excluido_em)
                VALUES (@id, @nome, @email, @senha, @tipo, @cpf, 1, @excluido)
                ON CONFLICT(id_usuario) DO UPDATE SET
                    nome_usuario = excluded.nome_usuario,
                    email_usuario = excluded.email_usuario,
                    senha_usuario = excluded.senha_usuario,
                    tipo_usuario = excluded.tipo_usuario,
                    cpf = excluded.cpf,
                    sincronizado = 1,
                    excluido_em = excluded.excluido_em
            `);

            // Upsert Profissional
            const stmtUpsertProf = db.prepare(`
                INSERT INTO profissional (id_profissional, id_usuario, especialidade, valor_consulta, sinal_consulta)
                VALUES (@id_prof, @id_user, @espec, @valor, @sinal)
                ON CONFLICT(id_profissional) DO UPDATE SET
                    id_usuario = excluded.id_usuario,
                    especialidade = excluded.especialidade,
                    valor_consulta = excluded.valor_consulta,
                    sinal_consulta = excluded.sinal_consulta
             `);

            const checkEmailStmt = db.prepare('SELECT id_usuario FROM usuario WHERE email_usuario = ?');
            const checkIdStmt = db.prepare('SELECT id_usuario FROM usuario WHERE id_usuario = ?');
            const updateIdStmt = db.prepare('UPDATE usuario SET id_usuario = ?, sincronizado = 1 WHERE id_usuario = ?');
            const deleteStmt = db.prepare('DELETE FROM usuario WHERE id_usuario = ?');

            const transacaoPull = db.transaction((dados) => {
                for (const u of dados) {
                    const uEmail = (u.email_usuario || '').trim().toLowerCase();

                    // 1. UNIFICAÇÃO: Verifica colisão de email (Local ID != Server ID)
                    const localPorEmail = checkEmailStmt.get(uEmail);

                    if (localPorEmail && localPorEmail.id_usuario.toString() !== u.id_usuario.toString()) {
                        console.log(`Unificando usuário por email: Local(${localPorEmail.id_usuario}) -> Server(${u.id_usuario})`);
                        // Lógica de unificação mantida
                        try {
                            const obstrucao = checkIdStmt.get(u.id_usuario.toString());
                            if (obstrucao) deleteStmt.run(u.id_usuario.toString());


                            try {
                                updateIdStmt.run(u.id_usuario.toString(), localPorEmail.id_usuario);
                                db.prepare('UPDATE agendamento SET id_usuario = ? WHERE id_usuario = ?').run(u.id_usuario.toString(), localPorEmail.id_usuario);
                                db.prepare('UPDATE agendamento SET id_profissional = ? WHERE id_profissional = ?').run(u.id_usuario.toString(), localPorEmail.id_usuario);
                                db.prepare('UPDATE profissional SET id_usuario = ? WHERE id_usuario = ?').run(u.id_usuario.toString(), localPorEmail.id_usuario);
                            } catch (e) {
                                throw e; // Propaga erro
                            }
                        } catch (e) {
                            console.error("Erro unificar IDs:", e.message);
                        }
                    }

                    // 1.5 ANTI-RESURRECTION
                    const localExistente = checkIdStmt.get(u.id_usuario.toString());
                    if (localExistente) {
                        const localFull = db.prepare('SELECT * FROM usuario WHERE id_usuario = ?').get(u.id_usuario.toString());
                        if (localFull && localFull.excluido_em && localFull.sincronizado === 0) {
                            continue;
                        }
                    }

                    // 2. SENHAS
                    let senhaHash = '$2a$10$NotSyncedxxxxxxxxxxxxxxxxxxxxxx';
                    const senhaVindaDaApi = u.senha_usuario || u.senha;
                    if (senhaVindaDaApi) {
                        if (senhaVindaDaApi.startsWith('$2')) {
                            senhaHash = senhaVindaDaApi.replace(/^\$2y\$/, '$2a$');
                        }
                    }

                    // 3. UPSERT USUARIO
                    stmtUpsert.run({
                        id: u.id_usuario.toString(),
                        nome: u.nome_usuario,
                        email: uEmail,
                        senha: senhaHash,
                        tipo: u.tipo_usuario || u.tipo,
                        cpf: u.cpf || '000.000.000-00',
                        excluido: u.excluido_em || null
                    });
                }
            });

            if (usuariosSite.length > 0) {
                try {
                    db.pragma('foreign_keys = OFF');
                    transacaoPull(usuariosSite);
                } finally {
                    db.pragma('foreign_keys = ON');
                }
            }

            // Sync Profissionais
            if (profissionaisSite.length > 0) {
                const transacaoProf = db.transaction((profs) => {
                    for (const p of profs) {
                        // Verifica se o usuario dono existe localmente (integridade)
                        const userExists = checkIdStmt.get(p.id_usuario.toString());
                        if (userExists) {
                            stmtUpsertProf.run({
                                id_prof: p.id_profissional ? p.id_profissional.toString() : uuidv4(), // Se nao tiver ID (?), gera
                                id_user: p.id_usuario.toString(),
                                espec: p.especialidade || '',
                                valor: p.valor_consulta || 0,
                                sinal: p.sinal_consulta || 0
                            });
                        }
                    }
                });
                transacaoProf(profissionaisSite);
            }

            return { success: true, message: "Sincronização bidirecional concluída." };

        } catch (error) {
            console.error("Erro na sincronização bidirecional (MySQL):", error);
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioModel;
