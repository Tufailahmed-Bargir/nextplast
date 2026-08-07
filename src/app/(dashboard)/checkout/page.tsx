import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/features/marketplace/services/cart";
import {
  getSavedAddresses,
} from "@/features/marketplace/services/checkout";
import { getMarketplaceFlags } from "@/features/marketplace/services/marketplace-settings";
import { getWalletBalance } from "@/features/dashboard/services/dashboard-queries";
import { CheckoutClient } from "@/features/marketplace/components/checkout-client";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/checkout");

  const flags = await getMarketplaceFlags();
  if (!flags.enabled) redirect("/marketplace");

  const [cart, walletBalance, savedAddresses] = await Promise.all([
    getCart(session.user.id),
    getWalletBalance(session.user.id),
    getSavedAddresses(session.user.id),
  ]);

  if (cart.items.length === 0) redirect("/cart");

  return (
    <div className="animate-fade-in">
      <CheckoutClient
        walletBalance={walletBalance}
        allowHybrid={flags.allowHybridPayments}
        subtotalInr={cart.subtotalInr}
        subtotalCoins={cart.subtotalCoins}
        itemCount={cart.itemCount}
        savedAddresses={savedAddresses}
        items={cart.items.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          quantity: i.quantity,
          lineInr: i.lineInr,
          lineCoins: i.lineCoins,
        }))}
      />
    </div>
  );
}
