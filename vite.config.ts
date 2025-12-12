
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
                // Removed @radix-ui/react-slot, clsx, tailwind-merge as they caused build errors
                ui: ['lucide-react'], 
                // Removed date-fns as it is not explicitly used/installed
                utils: ['@tanstack/react-query', 'zod', 'react-hook-form'] 
            }
        }
    }
  },
  server: {
    port: 3000,
  }
});
