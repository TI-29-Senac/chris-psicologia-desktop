import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// --- SEUS IMPORTS ---
import AgendamentoController from './Main/Controllers/AgendamentoController.js';
import { initDatabase } from './Main/Database/db.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// --- INSTÂNCIA DO SEU CONTROLADOR ---
const controllerAgendamento = new AgendamentoController();

// Inicializa o banco (cria a tabela se não existir)
initDatabase();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Configuração do Vite (Padrão do template Electron Forge + Vite)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // ==========================================================
  // --- SUAS ROTAS DE AGENDAMENTO (IPC HANDLERS) ---
  // ==========================================================

  // [CORREÇÃO] O Handler que faltava agora está no lugar certo!
  ipcMain.handle("agendamentos:get-form-data", async () => {
    console.log("Main: Buscando dados auxiliares (Pacientes/Profissionais)...");
    return await controllerAgendamento.getDadosAuxiliares();
  });

  // 1. Listar
  ipcMain.handle("agendamentos:listar", async () => {
    console.log("Main: Chamando listar agendamentos");
    return await controllerAgendamento.listar();
  })

  // 2. Cadastrar
  ipcMain.handle("agendamentos:cadastrar", async (event, agendamento) => {
    console.log("Main: Recebendo cadastro", agendamento);
    // Nota: Certifique-se que no AgendamentoController o método se chama 'cadastrar' mesmo
    const resultado = await controllerAgendamento.cadastrar(agendamento);
    return resultado;
  })

  // 3. Editar
  ipcMain.handle("agendamentos:editar", async (event, agendamento) => {
    console.log("Main: Editando agendamento", agendamento);
    const resultado = await controllerAgendamento.atualizarAgendamento(agendamento);
    return resultado;
  })

  // 4. Buscar por ID
  ipcMain.handle("agendamentos:buscarPorId", async (event, id) => {
    return await controllerAgendamento.buscarAgendamentoPorId(id);
  })

  // 5. Remover
  ipcMain.handle("agendamentos:remover", async (event, id) => {
    console.log("Main: Removendo ID", id);
    return await controllerAgendamento.removerAgendamento(id);
  })

  // --- Tema ---
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
  // [CORREÇÃO] Removi o handler daqui. Nada deve ser registrado aqui.
});