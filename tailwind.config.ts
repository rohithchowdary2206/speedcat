import type { Config } from "tailwindcss";

const athletiqColors = {
  // Official Athletiq Palette
  graphite: {
    DEFAULT: "#17191C",
    deep: "#121416",
    surface: "#292D32",
    border: "#373C42",
  },
  lime: {
    DEFAULT: "#B7F34A",
    hover: "#A3E435",
    light: "#C7F66D",
    muted: "rgba(183, 243, 74, 0.15)",
  },
  mint: {
    DEFAULT: "#E7F2D0",
    soft: "#E7F2D0",
  },
  offwhite: {
    DEFAULT: "#F5F5F2",
  },
  card: {
    DEFAULT: "#292D32",
    hover: "#32373D",
    border: "#373C42",
  },
  secondary: {
    DEFAULT: "#AEB4B0",
  },
  muted: "#AEB4B0",
  text: {
    DEFAULT: "#F5F5F2",
    secondary: "#AEB4B0",
  },

  // Central mapping for existing legacy classes to cleanly inherit the new palette:
  deep: "#17191C",
  navy: {
    DEFAULT: "#17191C",
    surface: "#292D32",
    card: "#292D32",
    950: "#121416",
    900: "#17191C",
    800: "#292D32",
    700: "#373C42",
    600: "#4B525A",
    500: "#6B7280",
    400: "#AEB4B0",
    300: "#CBD5E1",
    200: "#E2E8F0",
    100: "#F1F5F9",
    50: "#F5F5F2",
  },
  blue: {
    DEFAULT: "#B7F34A",
    hover: "#A3E435",
    50: "#F5FCE8",
    100: "#E7F2D0",
    200: "#D3F79C",
    300: "#C7F66D",
    400: "#B7F34A",
    500: "#B7F34A",
    600: "#A3E435",
    700: "#8AC427",
  },
  green: {
    DEFAULT: "#B7F34A",
    hover: "#A3E435",
    accent: "#B7F34A",
    50: "#F5FCE8",
    100: "#E7F2D0",
    200: "#D3F79C",
    300: "#C7F66D",
    400: "#B7F34A",
    500: "#B7F34A",
    600: "#A3E435",
    700: "#8AC427",
  },
  orange: {
    DEFAULT: "#B7F34A",
    hover: "#A3E435",
    accent: "#B7F34A",
    50: "#F5FCE8",
    100: "#E7F2D0",
    200: "#D3F79C",
    300: "#C7F66D",
    400: "#B7F34A",
    500: "#B7F34A",
    600: "#A3E435",
    700: "#8AC427",
  },
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        athletiq: athletiqColors,
        speedcat: athletiqColors, // Legacy backwards compatibility
        speecat: athletiqColors,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
