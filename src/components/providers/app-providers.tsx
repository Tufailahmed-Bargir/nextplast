"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Root client providers composition.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </TooltipProvider>
        </QueryProvider>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}
