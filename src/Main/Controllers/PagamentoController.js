import { ipcMain } from 'electron';
import PagamentoModel from '../Models/Pagamento.js';

class PagamentoController {
    constructor() {
        this.model = new PagamentoModel();
    }

    init() {
        ipcMain.handle('pagamento:listar', async () => this.model.listar());
        ipcMain.handle('pagamento:processar', async (event, dados) => this.model.processar(dados));
        ipcMain.handle('pagamento:total-mes', async () => this.model.obterTotalMes());
    }
}

export default PagamentoController;