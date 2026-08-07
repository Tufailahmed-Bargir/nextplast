import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/features/marketplace/services/cart";
import { CartClient } from "@/features/marketplace/components/cart-client";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/cart");

  const cart = await getCart(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Your cart</h1>
        <p className="text-sm text-muted-foreground">
          Saved to your account and synced across devices.
        </p>
      </div>
      <CartClient cart={cart} />
    </div>
  );
}
