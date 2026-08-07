import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-semibold text-primary">Offline</p>
        <h1 className="font-display mt-2 text-3xl font-bold">You appear offline</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Check your internet connection, then reload NexPlast. Cached pages may still work.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants())}>
        Retry home
      </Link>
    </div>
  );
}
