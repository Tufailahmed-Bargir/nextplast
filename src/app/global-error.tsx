"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Global error boundary UI (must define its own html/body).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[nexplast:global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white p-6 text-slate-900">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500">
            An unexpected error occurred. You can try again or return home.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
