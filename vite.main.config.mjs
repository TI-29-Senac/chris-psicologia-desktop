import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      // Lista de dependências que NÃO devem ser empacotadas pelo Vite
      // O Electron vai buscá-las diretamente na pasta node_modules
      external: ['better-sqlite3', 'bcrypt'] 
    }
  }
});