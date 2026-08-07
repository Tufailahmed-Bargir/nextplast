import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminListings } from "@/features/admin/services/admin-listings";
import { ListingTable } from "@/features/admin/components/listing-table";
import { AiReviewPanel } from "@/features/admin/components/ai-review-panel";

export const metadata: Metadata = { title: "Plastic Listings" };

export default async function AdminListingsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const listings = await listAdminListings({ take: 100 });
  const flagged = listings.filter((l) => l.status === "PENDING_REVIEW");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Plastic listings</h2>
        <p className="text-sm text-muted-foreground">
          Manage listings and review flagged AI detections.
        </p>
      </div>
      <AiReviewPanel listings={flagged} />
      <ListingTable listings={listings} />
    </div>
  );
}
