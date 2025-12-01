// src/preload.js
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    // Agendamentos
    listarAgendamentos: () => ipcRenderer.invoke('agendamentos:listar'),
    cadastrarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:cadastrar', dados),
    editarAgendamento: (dados) => ipcRenderer.invoke('agendamentos:editar', dados),
    removerAgendamento: (id) => ipcRenderer.invoke('agendamentos:remover', id),
    buscarAgendamentoPorId: (id) => ipcRenderer.invoke('agendamentos:buscarPorId', id),
    
    // Auxiliar (para preencher os selects, se você implementar no futuro)
    getDadosFormulario: () => ipcRenderer.invoke('agendamentos:get-form-data') 
});