import { ipcMain } from 'electron';
import AgendamentoModel from '../Models/Agendamento.js';

class AgendamentoController {
    
    constructor() {
        this.model = new AgendamentoModel();
    }

    init() {
        ipcMain.handle('agendamentos:cadastrar', async (event, data) => this.model.cadastrar(data));
        ipcMain.handle('agendamentos:get-form-data', async () => this.model.getDadosFormulario());
        ipcMain.handle('agendamentos:listar', async () => this.model.listar());
        ipcMain.handle('agendamentos:remover', async (event, id) => this.model.remover(id));
        ipcMain.handle('agendamentos:buscarPorId', async (event, id) => this.model.buscarPorId(id));
        ipcMain.handle('agendamentos:editar', async (event, data) => this.model.editar(data));
        ipcMain.handle('agendamentos:cancelar', async (event, id) => this.model.cancelar(id));
    }
}

export default AgendamentoController;