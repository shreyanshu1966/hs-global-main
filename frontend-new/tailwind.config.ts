import type { Config } from 'tailwindcss';

// Ported from the Vite app's tailwind.config.js (colors/fonts kept identical
// so migrated components look the same).
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2B2B2B',
        secondary: '#6B6B6B',
        accent: '#334155',
        cream: '#FAF8F5',
        divider: '#E8E3DC',
        accent2: '#6B7280',
        background: '#FFFFFF',
        text: {
          primary: '#1C1C1C',
          secondary: '#4A4A4A',
          light: '#FFFFFF',
        },
        stone: {
          light: '#E5E5E5',
          medium: '#9CA3AF',
          dark: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Inter', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};

export default config;
