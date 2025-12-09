import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDatabase } from './Main/Database/db.js';

// Importação dos Controladores
import PagamentoController from './Main/Controllers/PagamentoController.js';
import UsuarioController from './Main/Controllers/UsuarioController.js';
import AgendamentoController from './Main/Controllers/AgendamentoController.js';

// Inicializa o Banco de Dados ao arrancar
initDatabase();

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  // --- INICIALIZAÇÃO DOS CONTROLADORES ---
  // Isso faz o backend "ouvir" os eventos do preload
  new UsuarioController().init();
  new AgendamentoController().init();
  
  // Pagamento (Mantenha como estava se preferir, ou transforme em classe para padronizar)
  ipcMain.handle('pagamento:listar', async () => PagamentoController.listarPagamentos());
  ipcMain.handle('pagamento:processar', async (e, dados) => PagamentoController.processarPagamento(dados));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});