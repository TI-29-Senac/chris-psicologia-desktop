import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Isso diz ao Vite: "Não tente empacotar o better-sqlite3, deixe ele quieto"
      external: ['better-sqlite3', 'mysql2', 'mysql2/promise']
    }
  }
});