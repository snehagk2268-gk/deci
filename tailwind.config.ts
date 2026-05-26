import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#1e2a38",
          900: "#2c3e52",
          800: "#3d5166",
          700: "#4e6478",
          600: "#5e778a",
        },
        azure: {
          500: "#5A85A9",
          400: "#7aa3bf",
          300: "#B1CFEB",
          200: "#c8ddf2",
          100: "#D7DEF1",
          50:  "#edf1f9",
        },
        paper: {
          50:  "#D7DEF1",
          100: "#c8d8ee",
          200: "#B1CFEB",
        },
        mist: {
          DEFAULT: "#BFBBCB",
          light:   "#d8d5e0",
          dark:    "#a09aaf",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter Tight'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(90,133,169,0.06), 0 8px 24px rgba(90,133,169,0.10)",
        glow: "0 0 0 1px rgba(90,133,169,0.25), 0 12px 40px -12px rgba(90,133,169,0.40)",
      },
      backgroundImage: {
        "grid-azure":
          "linear-gradient(rgba(90,133,169,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(90,133,169,0.07) 1px, transparent 1px)",
        "radial-azure":
          "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35) 0%, rgba(177,207,235,0) 70%)",
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
