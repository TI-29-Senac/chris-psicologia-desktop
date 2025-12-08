import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    // --- AGENDAMENTOS ---
    listarAgendamentos: () => ipcRenderer.invoke('agendamentos:listar'),
    cadastrarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:cadastrar', dados),
    editarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:editar', dados),
    removerAgendamento: (id) => ipcRenderer.invoke('agendamentos:remover', id),
    buscarAgendamentoPorId: (id) => ipcRenderer.invoke('agendamentos:buscarPorId', id),
    
    // Faltava este para o botão "Desmarcar" funcionar
    cancelarAgendamento: (id) => ipcRenderer.invoke('agendamentos:cancelar', id),
    
    // Auxiliar para preencher os selects
    getDadosFormulario: () => ipcRenderer.invoke('agendamentos:get-form-data'),

    // --- USUÁRIOS (NOVO) ---
    // Essencial para a tela de cadastro funcionar
    cadastrarUsuario: (dados) => ipcRenderer.invoke('usuarios:cadastrar', dados),
});