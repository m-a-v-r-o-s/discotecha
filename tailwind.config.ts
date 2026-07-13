import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        pitch: "#0A0908",
        bone: "#EDEAE4",
        ash: "#6E6963",
        signal: "#FF2A00",
        ember: "#8E1500",
      },
      fontFamily: {
        display: ["'Bagel Fat One'", "cursive"],
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
        rise: "rise 900ms cubic-bezier(0.16,1,0.3,1) forwards",
        bleed: "bleed 1200ms cubic-bezier(0.16,1,0.3,1) forwards",
        flicker: "flicker 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
