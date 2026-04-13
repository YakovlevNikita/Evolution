import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@sdk': resolve(__dirname, 'src/sdk'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
