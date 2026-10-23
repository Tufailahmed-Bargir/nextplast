"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { useTransition } from "react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validations/auth";
import { forgotPasswordAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Forgot password form — issues a verification token (email delivery-ready).
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPasswordAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);

      const params = new URLSearchParams({ email: data.email });
      if (result.resetToken) {
        params.set("token", result.resetToken);
      }
      router.push(`/reset-password?${params.toString()}`);
    });
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-foreground text-3xl font-bold">
        Forgot password
      </h1>
      <p className="text-muted-foreground mt-2">
        Enter your email and we&apos;ll prepare a secure reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              className="pl-10"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" loading={pending} size="lg">
          {pending ? "Sending..." : "Continue"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm">
        <Link
          href="/login"
          className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </p>
    </div>
  );
}
