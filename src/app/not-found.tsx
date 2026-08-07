import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

/**
 * Custom 404 page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Back to home
        </Link>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
