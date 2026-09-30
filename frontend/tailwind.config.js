/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0B1B2E",
          900: "#0F2440",
          800: "#14304F",
          700: "#1D4067",
        },
        steel: {
          600: "#4A5D73",
          400: "#7C8FA3",
          200: "#D7DEE6",
          100: "#EAEFF3",
        },
        canvas: "#F3F5F7",
        accent: {
          DEFAULT: "#D9622B",
          dark: "#B84F21",
          light: "#F1A374",
        },
        success: "#1E7A4C",
        warning: "#C98A1B",
        danger: "#B23A3A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
