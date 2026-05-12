import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          black:  "#0d0b0a",
          dark:   "#1a1614",
          brown:  "#2c2220",
        },
        mustard: {
          DEFAULT: "#c9933a",
          light:   "#e8b455",
        },
        "deep-red":  "#8b1a1a",
        "red-bright": "#c0392b",
        sepia: {
          DEFAULT: "#8b7355",
          light:   "#c4a882",
        },
        parchment: "#f5e6c8",
        fog:       "#d4c9b8",
      },
      fontFamily: {
        display:    ["Georgia", "Times New Roman", "serif"],
        typewriter: ["Courier New", "Courier", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
