
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
                'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                'vendor-ui': ['lucide-react'], 
                'vendor-utils': ['@tanstack/react-query', 'zod', 'react-hook-form', 'uuid'],
                'vendor-supabase': ['@supabase/supabase-js']
            }
        }
    }
  },
  server: {
    port: 3000,
  }
});
