# Análise de Arquitetura e Melhorias

Este documento detalha pontos críticos da arquitetura atual e sugere correções para garantir escalabilidade, manutenibilidade e performance.

## 🚨 1. Duplicação de Código no Frontend (Crítico)

**Problema:**
A estrutura de **Menu Lateral (Sidebar)** e **Barra Superior (Top Bar)** está hardcoded (copiada e colada) em todos os arquivos HTML (`index.html`, `usuarios.html`, `agendamento.html`, etc.).

**Impacto:**
*   Se você precisar alterar um ícone no menu ou mudar o título da aplicação, terá que editar **todos** os arquivos HTML manualmente.
*   Aumenta a chance de inconsistência visual entre as telas.

**Solução Sugerida:**
*   **Curto Prazo:** Criar um script JavaScript simples (`layout.js`) que injeta o HTML da sidebar e do header dinamicamente em todas as páginas.
*   **Longo Prazo:** Migrar para uma arquitetura SPA (Single Page Application) ou usar um template engine, já que está usando Vite.

---

## 🐌 2. Arquitetura MPA (Multi-Page Application) em Desktop

**Problema:**
O uso de navegação por links (`<a href="...">`) causa um "piscar" na tela (full reload) a cada troca de página. Em aplicações Desktop (Electron), espera-se uma experiência fluida, similar a um aplicativo nativo.

**Impacto:**
*   Perda de estado (variáveis globais são resetadas a cada navegação).
*   Sensação de "site antigo" para o usuário.
*   Performance reduzida, pois re-inicia o parsing do CSS/JS a cada tela.

**Solução Sugerida:**
*   Transformar o `index.html` em um container principal e carregar o conteúdo das views dinamicamente dentro de uma `div#app-content` usando `fetch` ou importação dinâmica, sem recarregar a janela.

---

## 🔒 3. Validação e Segurança

**Problema:**
A validação de dados (ex: CPF, campos vazios) está duplicada ou, em alguns casos, reside apenas no Frontend.

**Análise:**
*   Vi validações básicas no `UsuarioController.js` (ótimo!), mas é importante garantir que o Frontend também valide visualmente antes de enviar, para melhorar a UX.
*   O uso de `db.prepare` com parâmetros (`@nome`, `@email`) no `UsuarioController.js` está correto e previne SQL Injection. **Mantenha isso.**

---

## 🛠 4. Organização do CSS

**Problema:**
O CSS parece estar fragmentado (`dashboard.css`, `usuarios.css`, etc.) e sendo importado manualmente em cada arquivo.

**Solução Sugerida:**
*   Criar um arquivo `global.css` ou `main.css` que contenha todas as variáveis de cores (`:root`), tipografia e resets e layout base.
*   Cada view deve importar apenas seu CSS específico **após** o CSS global. Isso já acontece parcialmente, mas pode ser padronizado.

---

## 💡 Plano de Ação Recomendado (Prioridade)

1.  **Refatorar Layout (Sidebar/Header):** Centralizar o HTML do menu em um único arquivo JS e injetá-lo.
2.  **Centralizar Constantes:** Se houver valores repetidos (cores, chaves de API), movê-los para um arquivo de configuração.
3.  **Melhorar Feedback Visual:** Garantir que todos os processos assíncronos (salvar, carregar) mostrem um "Loading..." ou spinner para o usuário não achar que o app travou.
