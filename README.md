# Chris Psicologia - Sistema de Gestão

## 🏗 Arquitetura do Projeto

Este projeto é uma aplicação Desktop construída com **Electron**, utilizando **Vite** como bundler e **SQLite** como banco de dados local.

### 🧩 Padrões Arquiteturais

O projeto segue uma arquitetura híbrida:

1.  **Main Process (Backend Local)**: Segue o padrão **MVC (Model-View-Controller)**.
    *   **Models**: Representações das tabelas do banco de dados (ex: `src/Main/Models/Usuario.js`).
    *   **Controllers**: Lógica de negócios e orquestração (ex: `src/Main/Controllers/UsuarioController.js`).
    *   **Database**: Camada de persistência usando `better-sqlite3` (ex: `src/Main/Database/db.js`).
    *   **Service**: Lógica auxiliar.

2.  **Renderer Process (Frontend)**: Segue o padrão **MPA (Multi-Page Application)**.
    *   Cada tela é um arquivo HTML independente (`.html`).
    *   JavaScript Vanilla (ES Modules) para lógica de interação.
    *   CSS Vanilla para estilização.
    *   Não utiliza frameworks SPA (React, Vue, etc.) para a renderização das views, embora use o Vite.

3.  **Comunicação (IPC)**:
    *   A comunicação entre o Frontend e o Backend ocorre via **Inter-Process Communication (IPC)**.
    *   O arquivo `preload.js` atua como uma ponte segura (`contextBridge`), expondo apenas funções específicas para o frontend através do objeto `window.api`.

---

## 🔄 Fluxo da Informação

O fluxo de dados segue um caminho unidirecional e seguro:

1.  **Interação do Usuário (Frontend)**:
    *   O usuário clica em um botão (ex: "Salvar Usuário") em `usuarios.html`.
    *   O arquivo `usuarios.js` captura o evento e chama `window.api.cadastrarUsuario(dados)`.

2.  **Ponte Segura (Preload)**:
    *   A chamada passa pelo `preload.js`, que invoca o canal IPC correspondente `ipcRenderer.invoke('usuarios:cadastrar', dados)`.

3.  **Processamento (Backend/Main)**:
    *   O arquivo principal (`main.js` ou equivalente que importa os controllers) escuta o evento.
    *   O `UsuarioController.js` recebe a requisição no método `cadastrar`.
    *   O Controller valida os dados e chama o banco de dados.

4.  **Persistência (Database)**:
    *   O `db.js` executa o comando SQL (INSERT/UPDATE/SELECT) no arquivo `clinica.db`.
    *   O resultado é retornado para o Controller.

5.  **Resposta**:
    *   O Controller retorna o resultado (sucesso ou erro) para o canal IPC.
    *   O Frontend (`usuarios.js`) recebe a Promise resolvida e atualiza a interface (ex: mostra alerta de sucesso e recarrega a tabela).

---

## 📂 Estrutura de Pastas Importante

```
src/
├── Main/                  # Lógica do Backend (Node.js)
│   ├── Controllers/       # Regras de Negócio
│   ├── Database/          # Conexão e Inicialização do SQLite
│   └── Models/            # Definição de Dados
├── Renderer/              # Interface do Usuário (Browser)
│   ├── Views/             # Telas do Sistema (HTML/JS/CSS)
│   └── Services/          # Lógica compartilhada do Frontend
├── preload.js             # Ponte de segurança (IPC)
└── index.html             # Tela Inicial (Dashboard)
```

## 🚀 Como Utilizar

1.  **Instalação**: `npm install`
2.  **Desenvolvimento**: `npm run dev` (Inicia o Electron com Hot Reload)
3.  **Build**: `npm run package` (Gera o executável)

## ⚠️ Pontos de Atenção

*   **Navegação**: O sistema usa links tradicionais (`<a href="...">`). Isso recarrega a página inteira a cada navegação.
*   **Banco de Dados**: O arquivo `clinica.db` é criado na pasta de dados do usuário do sistema operacional (`AppData` no Windows).
