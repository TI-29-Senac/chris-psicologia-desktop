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
        // Chama a API via Model
        return await this.usuarioModel.listar();
    }

    async buscarPorId(id) {
        return await this.usuarioModel.buscarPorId(id);
    }

    async cadastrar(dados) {
        try {
            // Validação simples antes de enviar para a API
            if (!dados.nome || !dados.email || !dados.senha) {
                return { success: false, erro: "Preencha os campos obrigatórios." };
            }
            
            // Envia para a API via Model
            return await this.usuarioModel.cadastrar(dados);
        } catch (erro) {
            return { success: false, erro: erro.message };
        }
    }

    async excluir(id) {
        return await this.usuarioModel.excluir(id);
    }
}

export default UsuarioController;