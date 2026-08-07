"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Auth.js session provider for client components.
 */
export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
