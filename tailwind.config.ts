import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#FAFAFA",
        primary: {
          DEFAULT: "#97FCE4",
          foreground: "#0A0A0A",
        },
        molten: {
          orange: "#FF6B35",
          red: "#FF3366",
        },
        card: {
          DEFAULT: "#141414",
          foreground: "#FAFAFA",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#A1A1AA",
        },
        border: "#262626",
        positive: "#22C55E",
        negative: "#EF4444",
      },
      backgroundImage: {
        "molten-gradient": "linear-gradient(135deg, #FF6B35 0%, #FF3366 100%)",
      },
      animation: {
        "flash-green": "flashGreen 0.6s ease-out",
        "flash-red": "flashRed 0.6s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "ticker": "ticker 30s linear infinite",
      },
      keyframes: {
        flashGreen: {
          "0%": { backgroundColor: "rgba(34, 197, 94, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        flashRed: {
          "0%": { backgroundColor: "rgba(239, 68, 68, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(151, 252, 228, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(151, 252, 228, 0.6)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
