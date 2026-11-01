import type { Config } from "tailwindcss";

const athletiqColors = {
  deep: "#0B1020",      // Main background
  card: "#1F2937",      // Cards and surfaces
  blue: {
    DEFAULT: "#2563EB", // Primary actions
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  orange: {
    DEFAULT: "#FF7139", // Secondary highlights / booking CTAs
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#FF7139",
    600: "#EA580C",
    700: "#C2410C",
    accent: "#FF7139",
  },
  text: "#F8FAFC",      // Primary text
  muted: "#A7B0C0",     // Secondary text
  navy: {
    DEFAULT: "#0B1020",
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#A7B0C0",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#0B1020",
    950: "#060A14",
  },
  green: {
    DEFAULT: "#2563EB", // Maps legacy classes to Electric Blue
    accent: "#FF7139",  // Maps legacy accent to Orange
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#2563EB",
    600: "#1D4ED8",
    700: "#1E40AF",
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
        speedcat: athletiqColors, // Backwards compatibility for existing markup
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
