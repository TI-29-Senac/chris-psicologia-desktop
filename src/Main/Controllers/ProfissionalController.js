import { ipcMain } from 'electron';
import ProfissionalModel from '../Models/Profissional.js';

class ProfissionalController {

    constructor() {
        this.profissionalModel = new ProfissionalModel();
    }

    init() {
        ipcMain.removeHandler('profissionais:listar');
        ipcMain.removeHandler('profissionais:cadastrar');
        ipcMain.removeHandler('profissionais:editar');
        ipcMain.removeHandler('profissionais:excluir');

        ipcMain.handle('profissionais:listar', async () => await this.listar());
        ipcMain.handle('profissionais:cadastrar', async (event, dados) => await this.cadastrar(dados));
        ipcMain.handle('profissionais:editar', async (event, dados) => await this.editar(dados));
        ipcMain.handle('profissionais:excluir', async (event, id) => await this.excluir(id));
    }

    async listar() {
        return await this.profissionalModel.listar();
    }

    async cadastrar(dados) {
        if (!dados.id_usuario || !dados.especialidade || !dados.valor_consulta) {
            return { success: false, erro: "Dados incompletos para profissional." };
        }
        return await this.profissionalModel.cadastrar(dados);
    }

    async editar(dados) {
        return await this.profissionalModel.editar(dados);
    }

    async excluir(id) {
        return await this.profissionalModel.excluir(id);
    }
}

export default ProfissionalController;