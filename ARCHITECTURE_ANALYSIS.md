# Análise de Arquitetura e Sugestões de Correção

Este documento detalha os pontos críticos identificados na análise do código, classificando-os por severidade e sugerindo soluções práticas.

## 🚨 1. Segurança Crítica: Armazenamento de Tokens (URGENTE)

**O Problema**:
O arquivo `src/Main/Utils/SecureStorage.js` **não é seguro**. Ele está salvando os tokens (Access e Refresh) em um arquivo JSON de texto plano.
```javascript
// src/Main/Utils/SecureStorage.js : Linha 17
const data = JSON.stringify({ accessToken, refreshToken });
fs.writeFileSync(this.filePath, data); // Texto puro
```
Qualquer script malicioso ou usuário com acesso à pasta pode ler esses tokens e impersonar o usuário na API.

**A Solução**:
Use a API nativa `safeStorage` do Electron, que utiliza o keychain do Sistema Operacional.

**Como Corrigir (em `SecureStorage.js`)**:
```javascript
import { safeStorage } from 'electron';

// Salvar
const encrypted = safeStorage.encryptString(token);
fs.writeFileSync(path, encrypted);

// Ler
const buffer = fs.readFileSync(path);
const token = safeStorage.decryptString(buffer);
```

---

## ⚠️ 2. Lógica de Autenticação Híbrida

**O Problema**:
No `AuthModel.js`, a lógica de fallback para offline depende de `catch (error)` ao tentar conectar. Se a API retornar um erro "soft" (ex: html de erro do servidor ao invés de JSON), o código pode interpretar incorretamente.
Além disso, `SecureStorage.saveTokens` está salvando tokens *antes* de confirmar que eles realmente funcionam para uma requisição subsequente (embora menos crítico).

**A Solução**:
Refinar o tratamento de erros no `FetchAPI.js` para garantir que apenas erros reais de conexão (TIMEOUT, ECONNREFUSED) disparem o modo offline. Erros de servidor (500) devem ser tratados diferente.

---

## 🛠️ 3. Arquitetura do Frontend (Escalabilidade)

**O Problema**:
O Frontend utiliza manipulação direta do DOM (`document.querySelector`) espalhada em múltiplos arquivos JS que são carregados globalmente ou via `<script type="module">` em cada HTML.
- **Risco**: Dificuldade de manter o estado da aplicação consistente entre telas.
- **Exemplo**: O `dashboard.js` lê dados do `localStorage` independentemente. Se o dado mudar em outra tela, o Dashboard não "sabe" até recarregar.

**A Solução (Curto Prazo)**:
Criar um **Estado Global** simples no Renderer.
1. Crie uma classe `Store.js` no Renderer.
2. Use um padrão Publish/Subscribe para que quando o dado mude, as telas atualizem sem reload.

**A Solução (Longo Prazo)**:
Migrar para um framework leve como **Vue.js** ou **React**, já que o build system (Vite) já está configurado e suportaria facilmente. Isso eliminaria 90% do código repetitivo de seleção de DOM.

---

## 🔄 4. Sincronização de Dados

**Observação**:
O código possui campos `sincronizado` nas tabelas, mas não identifiquei um **Serviço de Sincronização em Background** ativo no `main.js`.
Se a sincronização depender de ação do usuário (clicar em atualizar), o risco de conflito de dados (base suja) é alto.

**Sugestão**:
Implementar um `SyncService.js` no Main Process que rode um `setInterval` (ex: a cada 5 min) verificando:
1. Se há internet (`net.isOnline()`).
2. Se há registros com `sincronizado = 0` no SQLite.
3. Envie-os para a API silenciosamente.

---

## 📋 Resumo das Ações Recomendadas

| Prioridade | Ação | Arquivo Alvo |
| :--- | :--- | :--- |
| 🔴 **ALTA** | Implementar criptografia no Storage de Tokens | `src/Main/Utils/SecureStorage.js` |
| 🟠 **MÉDIA** | Centralizar estado do usuário no Frontend | `src/Renderer/Store.js` (Novo) |
| 🟡 **BAIXA** | Refatorar chamadas DOM para Web Components ou Framework | `src/Renderer/Views/**/*.js` |
