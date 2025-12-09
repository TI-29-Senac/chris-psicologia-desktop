// src/Main/Controllers/UsuarioController.js
import { ipcMain } from 'electron';
import db from '../Database/db.js';

class UsuarioController {
    
    init() {
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => this.cadastrar(dados));
    }

    async cadastrar(dados) {
        try {
            // 1. Validação Básica
            if (!dados.nome || !dados.email || !dados.senha) {
                return { success: false, erro: "Preencha os campos obrigatórios." };
            }

            // 2. Verifica e-mail duplicado
            const existe = db.prepare("SELECT id_usuario FROM usuario WHERE email = ?").get(dados.email);
            if (existe) return { success: false, erro: "E-mail já cadastrado." };

            // INÍCIO DA TRANSAÇÃO (Para garantir que salva tudo ou nada)
            const insertUser = db.transaction(() => {
                // A. Insere na tabela USUARIO
                const stmtUser = db.prepare(`
                    INSERT INTO usuario (nome_usuario, email, senha, tipo_usuario) 
                    VALUES (@nome, @email, @senha, @tipo)
                `);
                
                const info = stmtUser.run({
                    nome: dados.nome,
                    email: dados.email,
                    senha: dados.senha,
                    tipo: dados.tipo // 'cliente' ou 'profissional'
                });
                
                const novoIdUsuario = info.lastInsertRowid;

                // B. Se for PROFISSIONAL, insere os dados extras
                if (dados.tipo === 'profissional') {
                    if (!dados.especialidade || !dados.valor) {
                        throw new Error("Profissionais precisam de Especialidade e Valor.");
                    }

                    const stmtProf = db.prepare(`
                        INSERT INTO profissional (id_usuario, especialidade, valor_consulta)
                        VALUES (?, ?, ?)
                    `);
                    stmtProf.run(novoIdUsuario, dados.especialidade, parseFloat(dados.valor));
                }
            });

            // Executa a transação
            insertUser();
            
            return { success: true };

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            return { success: false, erro: erro.message };
        }
    }
}

export default UsuarioController;