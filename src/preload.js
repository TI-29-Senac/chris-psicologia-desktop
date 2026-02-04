import { contextBridge, ipcRenderer } from 'electron';

// Usamos contextBridge para expor a API de forma segura para o Renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Autenticação
  login: (credenciais) => ipcRenderer.invoke('auth:login', credenciais),
  logout: () => ipcRenderer.invoke('auth:logout'),
  onSessionExpired: (callback) => ipcRenderer.on('auth:session-expired', (_event, value) => callback(value)),

  // Usuários
  cadastrarUsuario: (dados) => ipcRenderer.invoke('usuarios:cadastrar', dados),
  listarUsuarios: () => ipcRenderer.invoke('usuarios:listar'),
  buscarUsuarioPorId: (id) => ipcRenderer.invoke('usuarios:buscarPorId', id),
  editarUsuario: (dados) => ipcRenderer.invoke('usuarios:editar', dados),
  excluirUsuario: (id) => ipcRenderer.invoke('usuarios:excluir', id),
  sincronizarBidirecional: () => ipcRenderer.invoke('usuarios:sincronizarBidirecional'),

  // LOGIN SESSÃO
  loginUsuario: (dados) => ipcRenderer.invoke('usuarios:login', dados),
  getCurrentUser: () => ipcRenderer.invoke('usuarios:getCurrentUser'),

  // Pagamentos
  processarPagamento: (dados) => ipcRenderer.invoke('pagamento:processar', dados),
  listarPagamentos: () => ipcRenderer.invoke('pagamento:listar'),

  // Agendamentos
  getDadosFormulario: () => ipcRenderer.invoke('agendamentos:get-form-data'),
  cadastrarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:cadastrar', dados),
  listarAgendamentos: () => ipcRenderer.invoke('agendamentos:listar'),
  removerAgendamento: (id) => ipcRenderer.invoke('agendamentos:remover', id),
  buscarAgendamentoPorId: (id) => ipcRenderer.invoke('agendamentos:buscarPorId', id),
  editarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:editar', dados),
  cancelarAgendamento: (id) => ipcRenderer.invoke('agendamentos:cancelar', id),
});