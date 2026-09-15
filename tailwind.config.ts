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
        canva: {
          purple: "#7d2ae8",
          blue: "#00c4cc",
          pink: "#ff5c93",
        },
      },
    },
  },
  plugins: [],
};
export default config;
