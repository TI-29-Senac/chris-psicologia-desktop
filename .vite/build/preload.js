"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // A View (Renderer) vai chamar esta função
  processarPagamento: (dados) => electron.ipcRenderer.invoke("pagamento:processar", dados),
  listarPagamentos: () => electron.ipcRenderer.invoke("pagamento:listar")
});
