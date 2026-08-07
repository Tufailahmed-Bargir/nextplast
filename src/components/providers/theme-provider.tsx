"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark / light theme provider (class strategy for Tailwind dark mode).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
