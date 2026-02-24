/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#19e66b",
        "primary-dark": "#14b856",
        "background-light": "#f6f8f7",
        "background-dark": "#112117",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2e22",
        "accent-blue": "#4dabf7",
        "accent-yellow": "#ffd43b",
        "accent-red": "#ff8787",
        "accent-purple": "#da77f2",
        "soft-blue": "#eef2ff",
        "trust-blue": "#3b82f6",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "2xl": "4rem",
        "full": "9999px",
      },
      animation: {
        "bounce-slight": "bounce-slight 2s ease-in-out infinite",
      },
      keyframes: {
        "bounce-slight": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
}
