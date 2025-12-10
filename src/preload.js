import { ipcRenderer } from 'electron';

// Como contextIsolation está desligado, atribuímos direto ao window
window.electronAPI = {
  cadastrarUsuario: (dados) => ipcRenderer.invoke('usuarios:cadastrar', dados),
  listarUsuarios: () => ipcRenderer.invoke('usuarios:listar'),
  buscarUsuarioPorId: (id) => ipcRenderer.invoke('usuarios:buscarPorId', id),
  editarUsuario: (dados) => ipcRenderer.invoke('usuarios:editar', dados),
  excluirUsuario: (id) => ipcRenderer.invoke('usuarios:excluir', id),
  processarPagamento: (dados) => ipcRenderer.invoke('pagamento:processar', dados),
  listarPagamentos: () => ipcRenderer.invoke('pagamento:listar'),

  // --- AGENDAMENTOS ---
  getDadosFormulario: () => ipcRenderer.invoke('agendamentos:get-form-data'),
  cadastrarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:cadastrar', dados),
  listarAgendamentos: () => ipcRenderer.invoke('agendamentos:listar'),
  removerAgendamento: (id) => ipcRenderer.invoke('agendamentos:remover', id),
  buscarAgendamentoPorId: (id) => ipcRenderer.invoke('agendamentos:buscarPorId', id),
  editarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:editar', dados),
  cancelarAgendamento: (id) => ipcRenderer.invoke('agendamentos:cancelar', id),
};