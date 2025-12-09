import { app, BrowserWindow, ipcMain } from 'electron'; 
import path from 'node:path';
import started from 'electron-squirrel-startup';
import AuthController from './Main/Controllers/AuthController.js';
import { initDatabase } from './Main/Database/db.js';
import APIFetch from './Main/Services/APIFetch.js';

const authController = new AuthController();
const apiremoto = new APIFetch();

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // Garanta que isso esteja true
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  const DB_FILE_NAME = 'clinica.db';
  const dbSourcePath = path.join(app.getAppPath(), DB_FILE_NAME);
  const dbTargetPath = path.join(app.getPath('userData'), DB_FILE_NAME);

  initDatabase(dbSourcePath, dbTargetPath);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.handle('auth:login', async (event, credenciais) => {
     return await authController.login(credenciais);
  });

  async function buscarUsuariosRemoto(){
    const resultado = await apiremoto.fetch("usuarios");
    await controlerUsuario.sincronizarAPIlocal(resultado.data.data);
  }
  buscarUsuariosRemoto();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});