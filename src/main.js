import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Controladores
import UsuarioController from './Main/Controllers/UsuarioController.js';
import AgendamentoController from './Main/Controllers/AgendamentoController.js';
import PagamentoController from './Main/Controllers/PagamentoController.js';
import AuthController from './Main/Controllers/AuthController.js';
import { initDatabase } from './Main/Database/db.js';

if (started) { app.quit(); }

// Objeto para manter as instâncias vivas na memória
const controllers = {};
initDatabase();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Configurações recomendadas para segurança
      contextIsolation: true, 
      nodeIntegration: false 
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  // Inicializa e armazena os controladores
  controllers.auth = new AuthController();
  controllers.usuario = new UsuarioController();
  controllers.agendamento = new AgendamentoController();
  controllers.pagamento = new PagamentoController();

  // Ativa os listeners de cada um
  Object.values(controllers).forEach(controller => {
    if (typeof controller.init === 'function') {
      controller.init();
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});