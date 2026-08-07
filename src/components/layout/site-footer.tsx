import Link from "next/link";
import { Mail, X, Globe2, Share2 } from "lucide-react";
import { Logo, CoinIcon } from "@/components/shared/brand";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "How It Works", href: "/#how" },
      { label: "AI Detection", href: "/#what" },
      { label: "Marketplace", href: "/#marketplace" },
      { label: "Nature Coins", href: "/#coins" },
      { label: "Environmental Impact", href: "/#impact" },
    ],
  },
  {
    title: "For Business",
    links: [
      { label: "For Collectors", href: "/register" },
      { label: "For Recyclers", href: "/register" },
      { label: "Partnerships", href: "/#business" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#what" },
      { label: "Contact", href: "mailto:support@nexplast.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Coin Policy", href: "/#coins" },
    ],
  },
];

/**
 * Marketing site footer — matches Frontend Design Footer.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40 pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An AI-powered circular economy platform turning plastic waste into
              Nature Coin rewards and eco products.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[X, Globe2, Share2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-emerald-300 hover:text-emerald-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NexPlast. Built for a circular future.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CoinIcon size={16} />
            <span>1 Nature Coin = 100 g recycled plastic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
