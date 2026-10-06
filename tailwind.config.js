/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        blank: {
          bg: "#0d0d0f",
          surface: "#16161a",
          elevated: "#1c1c22",
          border: "#2a2a32",
          muted: "#71717a",
          text: "#e4e4e7",
          accent: "#6366f1",
          "accent-hover": "#818cf8",
          success: "#22c55e",
          danger: "#ef4444",
          warning: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
        mono: ["Cascadia Code", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
