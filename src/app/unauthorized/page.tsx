import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

/**
 * 403 — authenticated but lacking role/permission.
 * Middleware redirects forbidden users here.
 */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-semibold text-primary">403</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Access denied</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Your account does not have permission to view this area of NexPlast.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Go to dashboard
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Home
        </Link>
      </div>
    </div>
  );
}
