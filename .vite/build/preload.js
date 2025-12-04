"use strict";
const renderer = require("electron/renderer");
renderer.contextBridge.exposeInMainWorld(
  "api",
  {
    login: (credenciais) => renderer.ipcRenderer.invoke("auth:login", credenciais)
  }
);
