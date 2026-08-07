import { AuthLayoutShell } from "@/components/layout/auth-layout-shell";

/**
 * Auth route group layout — login / register.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
