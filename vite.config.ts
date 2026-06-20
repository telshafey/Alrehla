import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React & Router bundle
          if (id.includes('react') || id.includes('react-router-dom') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          // UI Icons bundle
          if (id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          // Utilities bundle
          if (id.includes('@tanstack/react-query') || id.includes('zod') || id.includes('react-hook-form') || id.includes('uuid') || id.includes('@hookform/resolvers')) {
            return 'vendor-utils';
          }
          // Supabase bundle
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // Admin dashboard chunks (lazy loaded)
          if (id.includes('/components/admin/') || id.includes('/pages/admin/')) {
            return 'chunk-admin';
          }
          // Student portal chunks
          if (id.includes('/components/student/') || id.includes('/pages/student/')) {
            return 'chunk-student';
          }
          // Auth chunks
          if (id.includes('/components/auth/') || id.includes('/features/auth/')) {
            return 'chunk-auth';
          }
          // Order & Booking chunks
          if (id.includes('/features/enha-lak-order') || id.includes('/features/creative-writing-booking')) {
            return 'chunk-booking';
          }
        },
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || '';
          if (info.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(info)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'zod',
    ],
  },
  server: {
    port: 3000,
  },
  // Preview server (for testing production build)
  preview: {
    port: 4173,
  },
});
