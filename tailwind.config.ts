import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Near-black surfaces
        base: {
          DEFAULT: "#0A0A0A",
          950: "#050505",
          900: "#0A0A0A",
          850: "#0E0F10",
          800: "#141516",
          750: "#1A1B1D",
          700: "#222325",
          600: "#2E2F32",
        },
        // Hyperliquid mint-green primary
        mint: {
          DEFAULT: "#97FCE4",
          50: "#EAFFFA",
          100: "#CFFFF3",
          200: "#A8FEE9",
          300: "#97FCE4",
          400: "#5FE9CC",
          500: "#2FD3B2",
          600: "#17A98E",
        },
        gain: "#3BE38A",
        loss: "#FF5C6C",
        ai: "#B98CFF",
        warn: "#FFB84D",
        danger: "#FF5C6C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(151, 252, 228, 0.35)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "flash-green": {
          "0%": { backgroundColor: "rgba(59, 227, 138, 0.22)" },
          "100%": { backgroundColor: "transparent" },
        },
        "flash-red": {
          "0%": { backgroundColor: "rgba(255, 92, 108, 0.22)" },
          "100%": { backgroundColor: "transparent" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "flash-green": "flash-green 0.6s ease-out",
        "flash-red": "flash-red 0.6s ease-out",
        marquee: "marquee 40s linear infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
