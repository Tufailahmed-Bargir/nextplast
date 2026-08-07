import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listWishlist } from "@/features/marketplace/services/wishlist";
import { WishlistClient } from "@/features/marketplace/components/wishlist-client";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/wishlist");

  const items = await listWishlist(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          Synced to your account across devices.
        </p>
      </div>
      <WishlistClient items={items} />
    </div>
  );
}
