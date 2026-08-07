"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

export default function Error500({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-semibold text-primary">500</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          An unexpected error occurred. You can try again or return home.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Ref: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={cn(buttonVariants())}>
          Try again
        </button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Home
        </Link>
      </div>
    </div>
  );
}
