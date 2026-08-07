import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

/**
 * Registration page — email signup + Google OAuth.
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
