import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// --- SEUS IMPORTS ---
import AgendamentoController from './Main/Controllers/AgendamentoController.js';
import UsuarioController from './Main/Controllers/UsuarioController.js';
import { initDatabase } from './Main/Database/db.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// --- INSTÂNCIA DOS SEUS CONTROLADORES ---
const controllerAgendamento = new AgendamentoController();
const controllerUsuario = new UsuarioController(); // <--- Faltava instanciar isso

// Inicializa o banco (cria as tabelas se não existirem)
initDatabase();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Configuração do Vite
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  
  // ==========================================================
  // --- INICIALIZAÇÃO DOS CONTROLADORES ---
  // ==========================================================
  // Aqui chamamos o método .init() que criamos dentro das classes.
  // Eles registram automaticamente todos os ipcMain.handle()
  
  controllerAgendamento.init();
  controllerUsuario.init(); // <--- Isso habilita o cadastro de usuários!

  console.log("Main: Controladores inicializados.");

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // --- Tema (Handler avulso, pode ficar aqui) ---
  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});