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
        // Split node_modules into logical chunks so browsers don't download
        // one giant ~9.5MB vendor bundle up front (hurts LCP/TTI).
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router')) return 'router';
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (id.includes('gsap') || id.includes('locomotive-scroll') || id.includes('lenis') || id.includes('framer-motion') || id.includes('split-type')) return 'animation';
          if (id.includes('recharts') || id.includes('d3')) return 'charts';
          if (id.includes('@paypal')) return 'paypal';
          if (id.includes('swiper')) return 'swiper';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
          // country-state-city bundles every city on earth (~8MB) — isolate it
          // so it only loads on the checkout/address step, not the contact page.
          if (id.includes('country-state-city')) return 'geo';
          if (id.includes('react-phone-number-input')) return 'forms';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
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