import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
// import { initDatabase } from './Main/Database/db.js'; // Opcional: Banco local

// Controladores
import UsuarioController from './Main/Controllers/UsuarioController.js';
import AgendamentoController from './Main/Controllers/AgendamentoController.js';
import PagamentoController from './Main/Controllers/PagamentoController.js';
import AuthController from './Main/Controllers/AuthController.js';

// Inicializa Banco local (Se for usar apenas API, pode manter comentado ou remover)
// initDatabase();

if (started) { app.quit(); }

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  // Inicializa todos os controladores (MVC com API)
  new AuthController().init();
  new UsuarioController().init();
  new AgendamentoController().init();
  new PagamentoController().init(); // Agora instanciamos como classe para manter o padrão

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});