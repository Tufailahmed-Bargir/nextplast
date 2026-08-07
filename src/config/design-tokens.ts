/**
 * Design tokens aligned with the Frontend Design reference.
 * Primary green / emerald / teal eco theme + Nature Coin gold accents.
 */
export const designTokens = {
  colors: {
    primary: {
      DEFAULT: "#10b981",
      foreground: "#ffffff",
      50: "#ecfdf5",
      100: "#d1fae5",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      950: "#022c22",
    },
    secondary: {
      DEFAULT: "#059669",
      foreground: "#ffffff",
    },
    accent: {
      DEFAULT: "#14b8a6",
      foreground: "#ffffff",
    },
    coin: {
      DEFAULT: "#f59e0b",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      foreground: "#78350f",
    },
    sky: {
      DEFAULT: "#0ea5e9",
      500: "#0ea5e9",
    },
  },
  radius: {
    lg: "0.875rem",
    xl: "1.25rem",
    "2xl": "1.75rem",
    "3xl": "1.75rem",
  },
  shadows: {
    soft: "0 2px 8px -2px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.04)",
    card: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.08)",
    float: "0 8px 32px -8px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.06)",
    glow: "0 0 0 1px rgba(16,185,129,0.1), 0 8px 32px -8px rgba(16,185,129,0.25)",
    coin: "0 4px 16px -4px rgba(245,158,11,0.35)",
  },
  spacing: {
    section: "6rem",
    container: "80rem",
  },
  typography: {
    sans: "Plus Jakarta Sans",
    display: "Space Grotesk",
    mono: "JetBrains Mono",
  },
  animation: {
    fadeIn: "fade-in 0.5s ease-out",
    slideUp: "slide-up 0.6s ease-out",
    float: "float 4s ease-in-out infinite",
  },
} as const;
