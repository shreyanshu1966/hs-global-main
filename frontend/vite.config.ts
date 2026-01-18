import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import progress from 'vite-plugin-progress';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    progress(),
  ],

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'lucide-react',
    ],
    // Removed exclusions for gsap and locomotive-scroll to allow better optimization
  },

  build: {
    // Use esbuild for faster builds
    minify: 'esbuild',
    target: 'esnext',

    rollupOptions: {
      output: {
        // Simple manual chunking to avoid circular dependencies
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Performance optimizations
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: false,

    // Enable compression
    assetsInlineLimit: 4096,
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Performance improvements
    hmr: {
      overlay: false,
    },
  },

  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Optimize CSS
  css: {
    devSourcemap: false,
  },
});