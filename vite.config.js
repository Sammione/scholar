import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        search: resolve(__dirname, 'search.html')
      }
    }
  },
  server: {
    proxy: {
      '/api/openai': {
        target: 'https://api.openai.com/v1/chat/completions',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ''),
        headers: {
          'Origin': 'https://api.openai.com'
        }
      }
    }
  }
});
