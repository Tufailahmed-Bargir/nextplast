import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

/**
 * Login page — email/password + Google OAuth.
 */
export default function LoginPage() {
  return <LoginForm />;
}
