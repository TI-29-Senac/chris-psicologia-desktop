"use strict";
const electron = require("electron");
window.electronAPI = {
  cadastrarUsuario: (dados) => electron.ipcRenderer.invoke("usuarios:cadastrar", dados),
  listarUsuarios: () => electron.ipcRenderer.invoke("usuarios:listar"),
  buscarUsuarioPorId: (id) => electron.ipcRenderer.invoke("usuarios:buscarPorId", id),
  editarUsuario: (dados) => electron.ipcRenderer.invoke("usuarios:editar", dados),
  excluirUsuario: (id) => electron.ipcRenderer.invoke("usuarios:excluir", id),
  processarPagamento: (dados) => electron.ipcRenderer.invoke("pagamento:processar", dados),
  listarPagamentos: () => electron.ipcRenderer.invoke("pagamento:listar"),
  // --- AGENDAMENTOS ---
  getDadosFormulario: () => electron.ipcRenderer.invoke("agendamentos:get-form-data"),
  cadastrarAgendamento: (dados) => electron.ipcRenderer.invoke("agendamentos:cadastrar", dados),
  listarAgendamentos: () => electron.ipcRenderer.invoke("agendamentos:listar"),
  removerAgendamento: (id) => electron.ipcRenderer.invoke("agendamentos:remover", id),
  buscarAgendamentoPorId: (id) => electron.ipcRenderer.invoke("agendamentos:buscarPorId", id),
  editarAgendamento: (dados) => electron.ipcRenderer.invoke("agendamentos:editar", dados),
  cancelarAgendamento: (id) => electron.ipcRenderer.invoke("agendamentos:cancelar", id)
};
