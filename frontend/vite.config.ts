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
    exclude: ['gsap', 'locomotive-scroll'],
  },

  build: {
    // Use esbuild for faster builds (terser had compatibility issues)
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // Optimized manual chunks
        // manualChunks: (id) => {
        //   // React core - highest priority
        //   if (id.includes('node_modules/react') ||
        //     id.includes('node_modules/react-dom') ||
        //     id.includes('node_modules/react-router-dom')) {
        //     return 'react-core';
        //   }
        //
        //   // Heavy animation libraries - lazy load
        //   if (id.includes('node_modules/gsap')) {
        //     return 'gsap';
        //   }
        //   if (id.includes('node_modules/locomotive-scroll')) {
        //     return 'locomotive';
        //   }
        //
        //   // UI libraries
        //   if (id.includes('node_modules/lucide-react')) {
        //     return 'icons';
        //   }
        //   if (id.includes('node_modules/swiper')) {
        //     return 'swiper';
        //   }
        //
        //   // i18n
        //   if (id.includes('node_modules/i18next') ||
        //     id.includes('node_modules/react-i18next')) {
        //     return 'i18n';
        //   }
        //
        //   // Other vendor code
        //   if (id.includes('node_modules')) {
        //     return 'vendor';
        //   }
        // },

        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Performance optimizations
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    sourcemap: false,
    cssMinify: true,
    target: 'es2015',
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