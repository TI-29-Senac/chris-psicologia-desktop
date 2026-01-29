import { ipcMain } from 'electron';
import UsuarioModel from '../Models/Usuario.js';

class UsuarioController {
    
    constructor() {
        this.usuarioModel = new UsuarioModel();
    }

    /**
     * Inicializa os ouvintes do IPC.
     * Mapeia as chamadas do frontend (preload) para os métodos do backend (controller).
     */
    init() {
        // Remove handlers existentes para evitar erros de duplicidade ao reiniciar
        ipcMain.removeHandler('usuarios:cadastrar');
        ipcMain.removeHandler('usuarios:listar');
        ipcMain.removeHandler('usuarios:buscarPorId');
        ipcMain.removeHandler('usuarios:editar');
        ipcMain.removeHandler('usuarios:excluir');

        // Registra os handlers conforme as definições do seu preload.js
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => await this.cadastrar(dados));
        ipcMain.handle('usuarios:listar', async () => await this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => await this.buscarPorId(id));
        ipcMain.handle('usuarios:editar', async (event, dados) => await this.editar(dados));
        ipcMain.handle('usuarios:excluir', async (event, id) => await this.excluir(id));
    }

    async listar() {
        try {
            return await this.usuarioModel.listar();
        } catch (error) {
            console.error("Erro no Controller (listar):", error);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            return await this.usuarioModel.buscarPorId(id);
        } catch (error) {
            console.error("Erro no Controller (buscarPorId):", error);
            return null;
        }
    }

    async cadastrar(dados) {
        console.log(dados)
    try {
        // Validação usando os novos nomes padronizados
        if (!dados.nome_usuario || !dados.email_usuario || !dados.senha_usuario) {
            return { success: false, erro: "Campos obrigatórios faltando (nome_usuario, email_usuario ou senha_usuario)." };
        }
        
        // Repassa para o Model que utiliza o FetchAPI
        return await this.usuarioModel.cadastrar(dados);
    } catch (erro) {
        console.error("Erro no Controller Desktop:", erro);
        return { success: false, erro: erro.message };
    }
}

    async editar(dados) {
        try {
            if (!dados || !dados.id) {
                return { success: false, erro: "ID do usuário é necessário para edição." };
            }
            return await this.usuarioModel.editar(dados);
        } catch (error) {
            console.error("Erro no Controller (editar):", error);
            return { success: false, erro: error.message };
        }
    }

    async excluir(id) {
        try {
            if (!id) return { success: false, erro: "ID necessário para exclusão." };
            return await this.usuarioModel.excluir(id);
        } catch (error) {
            console.error("Erro no Controller (excluir):", error);
            return { success: false, erro: error.message };
        }
    }
}

export default UsuarioController;