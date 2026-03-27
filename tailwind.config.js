/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
    "./theme/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F49BD",
          primaryMuted: "#3474FF",
          navy: "#1E293B",
          navySoft: "#162033",
          navyDeep: "#0B1220",
          coral: "#FF7F50",
          coralSoft: "#FFDCCD",
          gold: "#FFD896",
        },
        surface: {
          DEFAULT: "#F6F9FC",
          elevated: "#ffffff",
          subtle: "#EDF3FF",
          dark: "#112038",
        },
        text: {
          primary: "#14213D",
          secondary: "#56657E",
          inverse: "#FFFFFF",
          muted: "#8B98AD",
        },
        success: "#22A06B",
        warning: "#E4A11B",
        danger: "#E35D6A",
        border: "#DFE8F2",
      },
      boxShadow: {
        luxe: "0 18px 32px rgba(18, 32, 58, 0.16)",
        card: "0 10px 18px rgba(18, 32, 58, 0.1)",
      },
      borderRadius: {
        card: "24px",
        xl: "30px",
        pill: "999px",
      },
      spacing: {
        4.5: "18px",
        5.5: "22px",
        7.5: "30px",
      },
      fontSize: {
        display: ["34px", { lineHeight: "40px", fontWeight: "700" }],
        h1: ["28px", { lineHeight: "34px", fontWeight: "700" }],
        h2: ["22px", { lineHeight: "28px", fontWeight: "700" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "18px", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
