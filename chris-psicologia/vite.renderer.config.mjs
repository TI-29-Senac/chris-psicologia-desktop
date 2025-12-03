import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Define os pontos de entrada do seu aplicativo
        main: resolve(__dirname, 'index.html'),
        pagamento: resolve(__dirname, 'src/Renderer/Views/Pagamento/pagamento.html'),
      },
    },
  },
});