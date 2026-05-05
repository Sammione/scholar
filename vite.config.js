import { defineConfig } from 'vite';

export default defineConfig({
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
