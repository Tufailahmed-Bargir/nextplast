import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

export default function Unauthorized401Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-semibold text-primary">401</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Sign in required</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Please sign in to continue to this NexPlast page.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/login" className={cn(buttonVariants())}>
          Sign in
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Home
        </Link>
      </div>
    </div>
  );
}
