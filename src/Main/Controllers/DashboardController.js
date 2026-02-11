import { ipcMain } from 'electron';
import DashboardModel from '../Models/Dashboard.js';

class DashboardController {

    constructor() {
        this.model = new DashboardModel();
    }

    init() {
        // Retorna tudo de uma vez para carregamento inicial
        ipcMain.handle('dashboard:get-summary', async () => {
            return await this.model.getResumo();
        });

        // Rotas individuais para filtros dinâmicos
        ipcMain.handle('dashboard:get-appointments', async (event, periodo) => {
            return await this.model.getAgendamentosFlow(periodo);
        });

        ipcMain.handle('dashboard:get-finance', async (event, ano) => {
            return await this.model.getFinanceiro(ano);
        });

        ipcMain.handle('dashboard:get-years', async () => {
            return await this.model.getAnosDisponiveis();
        });
    }
}

export default DashboardController;
