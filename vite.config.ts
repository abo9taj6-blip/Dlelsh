import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  build: {
    outDir: 'dist',
    // تحسين الأداء: تقسيم الكود إلى chunks أصغر
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion':       ['motion'],
          'icons':        ['lucide-react'],
        },
      },
    },
    // ضغط الأصول
    minify: 'terser',
    sourcemap: false,
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
