export const colors = {
  primary: {
    50: "#EAF2FF",
    100: "#D7E7FF",
    500: "#0F49BD",
    600: "#0C3E9F",
    700: "#082F78",
  },
  coral: {
    50: "#FFF1EB",
    100: "#FFDCCD",
    500: "#FF7F50",
    600: "#F06D39",
    700: "#D85724",
  },
  navy: {
    500: "#1E293B",
    700: "#162033",
    800: "#10192B",
    900: "#0B1220",
  },
  background: {
    app: "#F6F9FC",
    subtle: "#EEF4FA",
    softBlue: "#EDF3FF",
  },
  surface: {
    base: "#FFFFFF",
    muted: "#F8FBFF",
    premium: "#112038",
    premiumElevated: "#1A2742",
  },
  text: {
    primary: "#14213D",
    secondary: "#56657E",
    muted: "#8B98AD",
    inverse: "#FFFFFF",
    coral: "#FF7F50",
    blue: "#0F49BD",
  },
  border: {
    soft: "#DFE8F2",
    strong: "#CDD9E8",
    inverse: "rgba(255, 255, 255, 0.14)",
  },
  status: {
    success: "#22A06B",
    warning: "#E4A11B",
    danger: "#E35D6A",
  },
  overlay: {
    soft: "rgba(15, 73, 189, 0.08)",
    strong: "rgba(16, 25, 43, 0.2)",
  },
  gradients: {
    primary: ["#0F49BD", "#3474FF"] as const,
    coral: ["#FF7F50", "#FFA06E"] as const,
    navy: ["#1E293B", "#0B1220"] as const,
  },
} as const;
