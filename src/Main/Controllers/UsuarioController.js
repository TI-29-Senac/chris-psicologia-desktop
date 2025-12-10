import { ipcMain } from 'electron';
import UsuarioModel from '../Models/Usuario.js';

class UsuarioController {
    
    constructor() {
        this.usuarioModel = new UsuarioModel();
    }

    init() {
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => this.cadastrar(dados));
        ipcMain.handle('usuarios:listar', async () => this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => this.buscarPorId(id));
        ipcMain.handle('usuarios:excluir', async (event, id) => this.excluir(id));
    }

    async listar() {
        return await this.usuarioModel.listar();
    }

    async buscarPorId(id) {
        return await this.usuarioModel.buscarPorId(id);
    }

    async cadastrar(dados) {
        try {
            if (!dados.nome || !dados.email || !dados.senha) {
                return { success: false, erro: "Preencha os campos obrigatórios." };
            }

            // Verifica email duplicado (ajustado para nome da coluna 'email_usuario')
            const existe = db.prepare("SELECT id_usuario FROM usuario WHERE email_usuario = ?").get(dados.email);
            if (existe) return { success: false, erro: "E-mail já cadastrado." };

            // Transação para garantir integridade
            const insertUser = db.transaction(() => {
                const stmtUser = db.prepare(`
                    INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario, tipo_usuario, cpf, status_usuario) 
                    VALUES (@nome, @email, @senha, @tipo, '000.000.000-00', 'ativo')
                `);
                
                // 1. GERAÇÃO DO HASH DE SENHA
                const hash = bcrypt.hashSync(dados.senha, 10);
                
                const info = stmtUser.run({
                    nome: dados.nome,
                    email: dados.email,
                    senha: hash, // Gravando a senha criptografada
                    tipo: dados.tipo
                });
                
                const novoIdUsuario = info.lastInsertRowid;

                // Só insere em profissional se for do tipo profissional
                if (dados.tipo === 'profissional') {
                    if (!dados.especialidade || !dados.valor) {
                        throw new Error("Profissionais precisam de Especialidade e Valor.");
                    }

                    const stmtProf = db.prepare(`
                        INSERT INTO profissional (id_usuario, especialidade, valor_consulta, sinal_consulta)
                        VALUES (?, ?, ?, ?)
                    `);
                    
                    // Cálculo simples do sinal (20%) se não vier
                    const valor = parseFloat(dados.valor);
                    const sinal = valor * 0.2;

                    stmtProf.run(novoIdUsuario, dados.especialidade, valor, sinal);
                }
            });

            insertUser();
            return { success: true };

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            return { success: false, erro: erro.message };
        }
    }

    async excluir(id) {
        return await this.usuarioModel.excluir(id);
    }

    
}

export default UsuarioController;