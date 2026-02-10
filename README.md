# Arquitetura do Projeto - Chris Psicologia Desktop

Este documento descreve a arquitetura técnica, o fluxo de dados e a organização do código do projeto Desktop.

## 1. Visão Geral
O projeto é uma aplicação desktop construída com **Electron**, utilizando **Vite** para build e **SQLite** para armazenamento local. Ele opera em um modelo **Híbrido (Online-First)**, priorizando a conexão com uma API externa, mas mantendo funcionalidade offline completa através de sincronização de dados e cache de credenciais.

## 2. Tecnologias Principais
- **Runtime**: Electron (Main Process + Renderer Process)
- **Build Tool**: Vite (integração via `@electron-forge/plugin-vite`)
- **Backend Local**: Node.js (Main Process)
- **Banco de Dados**: `better-sqlite3` (SQLite local em `clinica.db`)
- **Frontend**: HTML5, CSS3, Vanilla JS (sem framework reativo como React/Vue)
- **Segurança**: `bcryptjs` para hash de senhas locais.

## 3. Estrutura de Diretórios
```
src/
├── Main/                    # Lógica do Processo Principal (Backend Local)
│   ├── Controllers/         # Regras de negócio e handlers de IPC
│   ├── Database/            # Configuração e tabelas do SQLite
│   ├── Models/              # Interação com Dados (API externa e DB local)
│   ├── Service/             # Serviços Utilitários (FetchAPI)
│   └── Utils/               # Utilitários (SecureStorage)
├── Renderer/                # Interface do Usuário (Frontend)
│   ├── Views/               # Telas organizadas por módulo (Usuario, Agendamento)
│   └── assets/              # Imagens e recursos estáticos
├── main.js                  # Ponto de entrada do Electron
├── preload.js               # Ponte segura (IPC) entre Main e Renderer
└── renderer.js              # Entry point global do frontend
```

## 4. Fluxo de Informação (Data Flow)

O fluxo segue o padrão **Renderer Request -> IPC Call -> Main Controller -> Model (API/DB) -> Response**.

### 4.1. Camada de Comunicação (IPC)
A comunicação entre o Frontend (Renderer) e o Backend Local (Main) é feita exclusivamente via `contextBridge` no arquivo `preload.js`.
- **Renderer**: Chama funções expostas em `window.electronAPI` (ex: `login`, `listarUsuarios`).
- **Preload**: Repassa a chamada via `ipcRenderer.invoke('canal', dados)`.
- **Main**: Ouve via `ipcMain.handle('canal', ...)` nos Controllers.

### 4.2. Fluxo de Autenticação (Exemplo Prático)
1.  **UI**: Usuário insere email/senha e clica em "Entrar".
2.  **Renderer**: Chama `window.electronAPI.login({ email, senha })`.
3.  **Main (AuthController)**: Recebe o pedido.
4.  **Model (AuthModel)**:
    *   **Tentativa 1 (Online)**: Envia POST para API externa (`desktop/login`).
        *   *Sucesso*: Salva hash da senha no SQLite local (para futuro offline) a retorna tokens.
        *   *Sucesso*: Salva Tokens (Access/Refresh) no `SecureStorage` (arquivo local).
    *   **Tentativa 2 (Offline)**: Se a rede falhar, busca o usuário no SQLite local e valida a senha usando `bcrypt.compare`.
5.  **Main**: Retorna o objeto do usuário para o Renderer.
6.  **Renderer**: Armazena dados não-sensíveis no `localStorage` para exibição e redireciona para o Dashboard.

## 5. Padrões de Arquitetura

### MVC (Model-View-Controller) Adaptado
*   **Controller (Main Process)**: Orquestra a requisição. Não contém lógica de UI, apenas decide qual Model chamar e trata erros.
*   **Model (Main Process)**: Contém a lógica "pesada" de dados. Decide se busca na API ou no SQLite.
*   **View (Renderer Process)**: HTML e JS puro. Responsável apenas por exibir dados e capturar eventos.

### Hybrid Sync (Offline-First Capability)
O sistema mantém uma cópia local dos dados essenciais (`usuario`, `profissional`, `agendamento`) no SQLite.
*   **Cache de Login**: Ao logar online, a senha é hashed e salva localmente.
*   **Sincronização**: O campo `sincronizado` (0 ou 1) nas tabelas indica registros que precisam ser enviados à API quando houver conexão.

## 6. Segurança
*   **Isolamento**: `nodeIntegration: false` e `contextIsolation: true` estão ativos, prevenindo que o código da UI acesse o sistema operacional diretamente.
*   **Senhas**: Senhas locais são armazenadas como hash (`bcrypt`), nunca em texto plano no banco.
*   **Tokens**: Tokens de sessão são persistidos em arquivo local (veja análise de riscos em `ARCHITECTURE_ANALYSIS.md`).
