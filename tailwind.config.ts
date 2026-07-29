import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Single source of truth is the channel triplets in globals.css, so the
      // SVG marks and the raw CSS can spend the same palette the utilities do.
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        pitch: "rgb(var(--pitch) / <alpha-value>)",
        bone: "rgb(var(--bone) / <alpha-value>)",
        ash: "rgb(var(--ash) / <alpha-value>)",
        signal: "rgb(var(--signal) / <alpha-value>)",
        ember: "rgb(var(--ember) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Bungee", "sans-serif"],
        sans: ["Archivo", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        door: "0.28em",
        tightest: "-0.045em",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bleed: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "48%": { opacity: "1" },
          "50%": { opacity: "0.35" },
          "52%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 900ms var(--ease-out) forwards",
        bleed: "bleed 1200ms var(--ease-out) forwards",
        flicker: "flicker 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
