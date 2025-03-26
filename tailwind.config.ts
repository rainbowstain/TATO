import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444",  // Usando el mismo color que red-500
        "primary-dark": "#b91c1c", // Equivalente a red-700
      },
      animation: {
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fadeIn": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        fadeIn: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow": "0 0 15px rgba(239, 68, 68, 0.5)",
      },
    },
  },
} satisfies Config;
