import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@domain': fileURLToPath(new URL('../../libs/domain/dist', import.meta.url)),
      '@validators': fileURLToPath(new URL('../../libs/validators/dist', import.meta.url)),
      '@auth': fileURLToPath(new URL('../../libs/auth/dist', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  optimizeDeps: {
    include: [
      '@upkeep-io/domain',
      '@upkeep-io/validators',
      '@upkeep-io/auth',
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
