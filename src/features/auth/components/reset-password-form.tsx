"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { Suspense, useTransition } from "react";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/validations/auth";
import { resetPasswordAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
    },
  });

  function onSubmit(data: ResetPasswordInput) {
    startTransition(async () => {
      const result = await resetPasswordAction(data);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof ResetPasswordInput, {
              message: messages[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo || "/login");
    });
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Reset password
      </h1>
      <p className="mt-2 text-muted-foreground">
        Choose a strong new password for your NexPlast account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              className="pl-10"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Reset token</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="token"
              className="pl-10 font-mono text-xs"
              {...register("token")}
            />
          </div>
          {errors.token ? (
            <p className="text-sm text-destructive">{errors.token.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              className="pl-10"
              autoComplete="new-password"
              {...register("password")}
            />
          </div>
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              className="pl-10"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending} size="lg">
          {pending ? "Updating..." : "Update password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">Loading...</div>}
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
