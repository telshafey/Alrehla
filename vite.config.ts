
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'react-router-dom'],
                ui: ['lucide-react', '@radix-ui/react-slot', 'clsx', 'tailwind-merge'],
                utils: ['@tanstack/react-query', 'zod', 'react-hook-form', 'date-fns']
            }
        }
    }
  },
  server: {
    port: 3000,
  }
});
