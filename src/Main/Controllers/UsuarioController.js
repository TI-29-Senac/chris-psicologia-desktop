import { ipcMain } from 'electron';
import db from '../Database/db.js';
import bcrypt from 'bcryptjs';

class UsuarioController {
    
    init() {
        // Registra as rotas que o frontend chama via window.api
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => this.cadastrar(dados));
        ipcMain.handle('usuarios:listar', async () => this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => this.buscarPorId(id));
        ipcMain.handle('usuarios:excluir', async (event, id) => this.excluir(id));
        ipcMain.handle('usuarios:editar', async (event, dados) => this.editar(dados));
    }

    // ... (restante do código acima)

    async listar() {
        try {
            // Tenta buscar com o filtro de excluídos
            const sql = `
                SELECT u.id_usuario, u.nome_usuario, u.email, u.cpf, u.tipo_usuario, 
                       p.especialidade 
                FROM usuario u
                LEFT JOIN profissional p ON u.id_usuario = p.id_usuario
                WHERE u.excluido_em IS NULL
                ORDER BY u.nome_usuario ASC
            `;
            return db.prepare(sql).all();
        } catch (erro) {
            console.error("Erro ao listar usuários (Usando Fallback):", erro);
            
            // CORREÇÃO: O Fallback agora TAMBÉM busca a especialidade
            // Isso resolve o problema caso a coluna 'excluido_em' não exista
            try {
                const sqlFallback = `
                    SELECT u.id_usuario, u.nome_usuario, u.email, u.cpf, u.tipo_usuario, 
                           p.especialidade 
                    FROM usuario u
                    LEFT JOIN profissional p ON u.id_usuario = p.id_usuario
                    ORDER BY u.nome_usuario ASC
                `;
                return db.prepare(sqlFallback).all();
            } catch (err2) {
                // Se der erro até nisso, retorna o básico (sem especialidade)
                console.error("Erro crítico no banco:", err2);
                return db.prepare("SELECT * FROM usuario").all();
            }
        }
    }
    
    async buscarPorId(id) {
        try {
            const usuario = db.prepare("SELECT * FROM usuario WHERE id_usuario = ?").get(id);
            if (!usuario) return null;

            if(usuario.tipo_usuario === 'profissional'){
                const prof = db.prepare("SELECT * FROM profissional WHERE id_usuario = ?").get(id);
                // Retorna dados do usuário + dados do profissional
                return { ...usuario, ...prof }; 
            }
            return usuario;
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            return null;
        }
    }

    async cadastrar(dados) {
        try {
            // 1. Validação Completa (Incluindo CPF)
            if (!dados.nome || !dados.email || !dados.senha || !dados.cpf) {
                return { success: false, erro: "Preencha todos os campos obrigatórios." };
            }

            // 2. Verificações de Duplicidade
            const existeEmail = db.prepare("SELECT id_usuario FROM usuario WHERE email = ?").get(dados.email);
            if (existeEmail) return { success: false, erro: "E-mail já cadastrado." };

            const existeCpf = db.prepare("SELECT id_usuario FROM usuario WHERE cpf = ?").get(dados.cpf);
            if (existeCpf) return { success: false, erro: "CPF já cadastrado." };

            // 3. Transação de Cadastro (Garante integridade)
            const realizarCadastro = db.transaction((user) => {
                const hash = bcrypt.hashSync(user.senha, 10);

                // Insere na tabela USUARIO com CPF
                const stmtUser = db.prepare(`
                    INSERT INTO usuario (nome_usuario, email, cpf, senha, tipo_usuario) 
                    VALUES (@nome, @email, @cpf, @senha, @tipo)
                `);
                
                const info = stmtUser.run({
                    nome: user.nome,
                    email: user.email,
                    cpf: user.cpf, // Capturando o CPF aqui
                    senha: hash,
                    tipo: user.tipo 
                });
                
                const novoIdUsuario = info.lastInsertRowid;

                // Insere na tabela PROFISSIONAL (se necessário)
                if (user.tipo === 'profissional') {
                    if (!user.especialidade || !user.valor) {
                        throw new Error("Dados de especialidade/valor incompletos.");
                    }

                    const stmtProf = db.prepare(`
                        INSERT INTO profissional (id_usuario, especialidade, valor_consulta)
                        VALUES (?, ?, ?)
                    `);
                    
                    stmtProf.run(novoIdUsuario, user.especialidade, parseFloat(user.valor));
                }
            });

            // Executa a transação
            realizarCadastro(dados);
            
            return { success: true };

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            return { success: false, erro: erro.message };
        }
    }

    async editar(dados) {
        try {
            if (!dados.id || !dados.nome || !dados.email) {
                return { success: false, erro: "Dados básicos obrigatórios." };
            }

            const transacaoEditar = db.transaction((user) => {
                // 1. Atualiza dados básicos (CPF geralmente não se edita, então não incluí no UPDATE)
                let sql = `UPDATE usuario SET nome_usuario = @nome, email = @email`;
                const params = { nome: user.nome, email: user.email, id: user.id };

                // Só atualiza a senha se o usuário digitou uma nova
                if (user.senha && user.senha.trim() !== "") {
                    const hash = bcrypt.hashSync(user.senha, 10);
                    sql += `, senha = @senha`;
                    params.senha = hash;
                }

                sql += ` WHERE id_usuario = @id`;
                db.prepare(sql).run(params);

                // 2. Atualiza dados de profissional se for o caso
                if (user.tipo === 'profissional') {
                    db.prepare(`
                        UPDATE profissional 
                        SET especialidade = ?, valor_consulta = ? 
                        WHERE id_usuario = ?
                    `).run(user.especialidade, parseFloat(user.valor), user.id);
                }
            });

            transacaoEditar(dados);
            return { success: true };

        } catch (error) {
            console.error("Erro na edição:", error);
            return { success: false, erro: error.message };
        }
    }

    async excluir(id) {
        try {
            // Tenta Soft Delete primeiro
            db.prepare("UPDATE usuario SET excluido_em = CURRENT_TIMESTAMP WHERE id_usuario = ?").run(id);
            return { success: true };
        } catch (error) {
            // Se a coluna não existir, faz Delete Físico
            if (error.message.includes("no such column")) {
                db.prepare("DELETE FROM usuario WHERE id_usuario = ?").run(id);
                return { success: true };
            }
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioController;