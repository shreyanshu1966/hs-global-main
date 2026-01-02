/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        hero: "url('../project/public/slider/slider1.webp')",
        product_banner: "url('/banner/banner-imge.jpg')",
        feature_banner: "url('/feature/gallerybanner.jpg')",
      },
      colors: {
        primary: "#1C1C1C",
        secondary: "#F5F5F5",
        accent: "#B8860B",
        accent2: "#DAA520",
        background: "#FFFFFF",
        text: {
          primary: "#1C1C1C",
          secondary: "#4A4A4A",
          light: "#FFFFFF",
        },
        stone: {
          light: "#E5E5E5",
          medium: "#9CA3AF",
          dark: "#4B5563",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "inner-lg": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
