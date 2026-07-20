/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "rgb(var(--base-950) / <alpha-value>)", // page background
          900: "rgb(var(--base-900) / <alpha-value>)", // sidebar
          800: "rgb(var(--base-800) / <alpha-value>)", // cards
          700: "rgb(var(--base-700) / <alpha-value>)", // card borders / hover
          600: "rgb(var(--base-600) / <alpha-value>)", // dividers
        },
        ink: {
          50: "rgb(var(--ink-50) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        accent: {
          green: "rgb(var(--accent-green) / <alpha-value>)",
          blue: "rgb(var(--accent-blue) / <alpha-value>)",
          amber: "rgb(var(--accent-amber) / <alpha-value>)",
          gold: "rgb(var(--accent-gold) / <alpha-value>)",
          sky: "rgb(var(--accent-sky) / <alpha-value>)",
          purple: "rgb(var(--accent-purple) / <alpha-value>)",
          red: "rgb(var(--accent-red) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px -8px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
