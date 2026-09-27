import Link from "next/link";
import { ClipboardList, Leaf, Recycle, Store, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/sell",
    label: "Sell Plastic",
    icon: Recycle,
    className: "text-emerald-600",
  },
  {
    href: "/listings",
    label: "My Listings",
    icon: ClipboardList,
    className: "text-sky-600",
  },
  {
    href: "/impact",
    label: "Impact",
    icon: Leaf,
    className: "text-lime-600",
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: Store,
    className: "text-teal-600",
  },
  {
    href: "/wallet",
    label: "View Wallet",
    icon: Wallet,
    className: "coin-text",
  },
] as const;

/**
 * Primary dashboard quick actions.
 */
export function QuickActions() {
  return (
    <Card className="overflow-visible self-start">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-xl border border-border p-4 text-left transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <action.icon className={cn("mb-2 h-5 w-5", action.className)} />
              <p className="text-sm font-medium text-foreground">{action.label}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
