import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Recycle } from "lucide-react";
import { auth } from "@/auth";
import { listUserListings } from "@/features/plastic/services/listing-service";
import { ListingCard } from "@/features/plastic/components/listing-card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My listings",
};

/**
 * Plastic listing history for the authenticated user.
 */
export default async function ListingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listings = await listUserListings(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">My listings</h2>
          <p className="text-sm text-muted-foreground">
            Track plastic submissions from AI review through coin credit.
          </p>
        </div>
        <Link href="/sell" className={cn(buttonVariants())}>
          New listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <DashboardEmpty
          icon={Recycle}
          title="No listings yet"
          description="Sell plastic to create your first AI-verified listing and schedule a pickup."
        />
      ) : (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              status={listing.status}
              pickupStatus={listing.pickupRequest?.status}
              claimedWeightGrams={listing.claimedWeightGrams}
              estimatedCoins={
                listing.estimatedCoins
                  ? Number(listing.estimatedCoins)
                  : null
              }
              finalCoins={
                listing.finalCoins ? Number(listing.finalCoins) : null
              }
              imageUrl={listing.images[0]?.url ?? null}
              createdAt={listing.createdAt}
              href={`/sell/${listing.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
