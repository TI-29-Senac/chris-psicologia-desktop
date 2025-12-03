// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // A View (Renderer) vai chamar esta função
  processarPagamento: (dados) => ipcRenderer.invoke('pagamento:processar', dados),
  listarPagamentos: () => ipcRenderer.invoke('pagamento:listar'),
});
