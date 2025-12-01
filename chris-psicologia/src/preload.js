import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld(
    'api', {
        login: (credenciais) => ipcRenderer.invoke('auth:login', credenciais),
    }
)