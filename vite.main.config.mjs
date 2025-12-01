import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Isso é o que corrige o erro do better-sqlite3
      external: ['better-sqlite3', 'bcryptjs'] 
    }
  }
});