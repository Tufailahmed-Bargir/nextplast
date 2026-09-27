import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExternalLink, Navigation } from "lucide-react";
import { auth } from "@/auth";
import {
  getCollectorContext,
  listCollectorPickups,
} from "@/features/collector/services/pickup-queries";
import {
  googleMapsDirectionsUrl,
  googleMapsSearchUrl,
} from "@/features/collector/lib/maps";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Navigation",
};

/**
 * Simple maps handoff for college-project scope (future: live tracking).
 */
export default async function CollectorNavigationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const collector = await getCollectorContext(session.user.id);
  const [today, assigned] = await Promise.all([
    listCollectorPickups(collector.id, "today"),
    listCollectorPickups(collector.id, "assigned"),
  ]);
  const stops = today.length > 0 ? today : assigned;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Navigation</h2>
        <p className="text-sm text-muted-foreground">
          Open pickup addresses in Google Maps. Live tracking comes later.
        </p>
      </div>

      {stops.length === 0 ? (
        <DashboardEmpty
          icon={Navigation}
          title="No stops yet"
          description="Assigned pickups will appear here with map links."
        />
      ) : (
        <div className="space-y-3">
          {stops.map((pickup) => (
            <Card key={pickup.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  #{pickup.id.slice(0, 8)} ·{" "}
                  {pickup.listing.user.name ?? "Customer"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{pickup.address}</p>
                {pickup.distanceKm != null ? (
                  <p className="text-xs text-muted-foreground">
                    Approx. {Number(pickup.distanceKm)} km
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={googleMapsSearchUrl(pickup.address, pickup)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Open Maps <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={googleMapsDirectionsUrl(pickup.address, pickup)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                    )}
                  >
                    Directions
                  </a>
                  <Link
                    href={`/collector/pickups/${pickup.id}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Open pickup
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
