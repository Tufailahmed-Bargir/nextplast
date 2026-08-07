import Link from "next/link";
import { Logo } from "@/components/shared/brand";

/**
 * Auth layout shell — split branding panel + form content area.
 * Visual language from Frontend Design AuthPage.
 */
export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 lg:flex lg:w-1/2">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex w-full flex-col justify-between p-12 text-white">
          <Link href="/">
            <Logo className="[&_span]:text-white [&_.gradient-text]:text-white [&_.gradient-text]:bg-none [&_.gradient-text]:[-webkit-text-fill-color:white]" />
          </Link>
          <div>
            <p className="mb-4 text-sm font-medium text-emerald-100">
              Join the circular economy
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Turn waste into worth.
              <br />
              Earn while you heal the planet.
            </h2>
            <p className="mt-4 max-w-md text-emerald-50/90">
              AI-powered plastic detection, verified collectors, and Nature Coin
              rewards — redeemable in the NexPlast Marketplace.
            </p>
          </div>
          <p className="text-sm text-emerald-100/80">
            © {new Date().getFullYear()} NexPlast. Convert Plastic Into Value.
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
