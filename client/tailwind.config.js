/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
        display: ["Sora", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        ink: {
          950: "#07111f",
        },
      },
      boxShadow: {
        soft: "0 24px 60px -28px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        "dashboard-light":
          "radial-gradient(circle at top left, rgba(34,211,238,0.22), transparent 36%), radial-gradient(circle at top right, rgba(59,130,246,0.16), transparent 28%), linear-gradient(180deg, #f7fbff 0%, #eef4ff 100%)",
        "dashboard-dark":
          "radial-gradient(circle at top left, rgba(34,211,238,0.18), transparent 28%), radial-gradient(circle at top right, rgba(251,191,36,0.08), transparent 22%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
      },
    },
  },
  plugins: [],
};
