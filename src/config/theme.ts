/**
 * Design tokens are consumed by the theme layer and shared UI.
 * Import from `@/config` when components need token values in JS.
 */
import { designTokens } from "@/config/design-tokens";

export const theme = {
  radius: designTokens.radius,
  shadows: designTokens.shadows,
  colors: designTokens.colors,
  typography: designTokens.typography,
  animation: designTokens.animation,
  spacing: designTokens.spacing,
} as const;
