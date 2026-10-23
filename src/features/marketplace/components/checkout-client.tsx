"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckoutStepper,
  type CheckoutStepId,
} from "@/features/marketplace/components/checkout-stepper";
import { PaymentSelector } from "@/features/marketplace/components/hybrid-price-selector";
import { placeOrderAction } from "@/features/marketplace/actions/marketplace-actions";
import {
  previewCheckoutTotals,
  shippingChargeInr,
} from "@/features/marketplace/lib/pricing";
import { formatCoin, formatInr } from "@/utils/coin";
import {
  shippingAddressSchema,
  type ShippingAddress,
} from "@/validations/marketplace";
import { cn } from "@/lib/utils";
import { PaymentMode } from "@prisma/client";

interface CheckoutClientProps {
  walletBalance: number;
  allowHybrid: boolean;
  subtotalInr: number;
  subtotalCoins: number;
  itemCount: number;
  savedAddresses: ShippingAddress[];
  items: {
    productId: string;
    name: string;
    quantity: number;
    lineInr: number;
    lineCoins: number;
  }[];
}

function newCheckoutId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CheckoutClient({
  walletBalance,
  allowHybrid,
  subtotalInr,
  subtotalCoins,
  itemCount,
  savedAddresses,
  items,
}: CheckoutClientProps) {
  const [pending, startTransition] = useTransition();
  const [checkoutId] = useState(newCheckoutId);
  const [step, setStep] = useState<CheckoutStepId>("address");
  const [delivery, setDelivery] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [payment, setPayment] = useState<{
    mode: "CASH" | "COINS" | "HYBRID";
    coinsToRedeem: number;
  }>({
    mode: allowHybrid ? "HYBRID" : "CASH",
    coinsToRedeem: Math.min(walletBalance, subtotalCoins),
  });
  const [address, setAddress] = useState<ShippingAddress>(
    savedAddresses[0] ?? {
      fullName: "",
      phone: "",
      addressLine1: "",
      city: "",
      pinCode: "",
    },
  );
  const [notes, setNotes] = useState("");
  const [placedId, setPlacedId] = useState<string | null>(null);

  const shipping = shippingChargeInr(delivery);

  const preview = useMemo(() => {
    try {
      return previewCheckoutTotals({
        mode: payment.mode as PaymentMode,
        merchandiseInr: subtotalInr,
        listCoins: subtotalCoins,
        coinsToRedeem: payment.coinsToRedeem,
        walletBalance,
        allowHybrid,
        shippingInr: shipping,
      });
    } catch {
      return {
        coinAmount: 0,
        merchandiseCashInr: subtotalInr,
        shippingInr: shipping,
        cashAmountInr: subtotalInr + shipping,
      };
    }
  }, [
    payment,
    subtotalInr,
    subtotalCoins,
    walletBalance,
    allowHybrid,
    shipping,
  ]);

  function goDelivery() {
    const parsed = shippingAddressSchema.safeParse(address);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Complete your address.");
      return;
    }
    setStep("delivery");
  }

  function place() {
    startTransition(async () => {
      const result = await placeOrderAction({
        paymentMode: payment.mode,
        coinsToRedeem: payment.coinsToRedeem,
        deliveryMethod: delivery,
        shippingAddress: address,
        saveAddress: true,
        notes: notes || undefined,
        checkoutId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setPlacedId(result.data.orderId);
    });
  }

  if (placedId) {
    return (
      <div className="animate-scale-in flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h2 className="font-display text-2xl font-bold">Order placed!</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-center">
          Your eco products are being processed. Order #{placedId.slice(0, 8)}.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/orders"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            View orders
          </Link>
          <Link href={`/orders/${placedId}`} className={cn(buttonVariants())}>
            Order details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/cart"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>
      <h1 className="font-display text-2xl font-bold">Checkout</h1>
      <CheckoutStepper current={step} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {step === "address" ? (
            <Card>
              <CardHeader>
                <CardTitle>Shipping address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {savedAddresses.length > 0 ? (
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    {savedAddresses.map((a, idx) => (
                      <button
                        key={`${a.pinCode}-${idx}`}
                        type="button"
                        className="border-border hover:bg-muted/50 rounded-xl border px-3 py-2 text-left text-sm"
                        onClick={() => setAddress(a)}
                      >
                        <p className="font-medium">{a.label ?? a.fullName}</p>
                        <p className="text-muted-foreground text-xs">
                          {a.addressLine1}, {a.city}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address line 1</Label>
                  <Input
                    value={address.addressLine1}
                    onChange={(e) =>
                      setAddress({ ...address, addressLine1: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>PIN code</Label>
                  <Input
                    value={address.pinCode}
                    onChange={(e) =>
                      setAddress({ ...address, pinCode: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  className="sm:col-span-2"
                  onClick={goDelivery}
                >
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {step === "delivery" ? (
            <Card>
              <CardHeader>
                <CardTitle>Delivery method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    ["STANDARD", "Standard (3–5 days)", 0],
                    ["EXPRESS", "Express (1–2 days)", 79],
                  ] as const
                ).map(([id, label, fee]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDelivery(id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                      delivery === id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                        : "border-border"
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    <span>{fee === 0 ? "Free" : formatInr(fee)}</span>
                  </button>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("address")}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep("payment")}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === "payment" ? (
            <div className="space-y-4">
              <PaymentSelector
                merchandiseInr={subtotalInr}
                listCoins={subtotalCoins}
                shippingInr={shipping}
                walletBalance={walletBalance}
                allowHybrid={allowHybrid}
                value={payment}
                onChange={setPayment}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("delivery")}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setStep("review")}>
                  Review order
                </Button>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <Card>
              <CardHeader>
                <CardTitle>Review order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {items.map((item) => (
                    <li
                      key={item.productId}
                      className="bg-muted/40 flex justify-between rounded-xl px-3 py-2"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>
                        {formatCoin(item.lineCoins)} · {formatInr(item.lineInr)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="text-sm">
                  <p>
                    Ship to {address.fullName}, {address.addressLine1},{" "}
                    {address.city} {address.pinCode}
                  </p>
                  <p className="text-muted-foreground">
                    {delivery === "EXPRESS" ? "Express" : "Standard"} ·{" "}
                    {payment.mode.toLowerCase()}
                  </p>
                </div>
                <Textarea
                  placeholder="Order notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("payment")}
                  >
                    Back
                  </Button>
                  <Button type="button" loading={pending} onClick={place}>
                    {pending ? "Placing…" : "Place order"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Items ({itemCount})</span>
              <span>{formatInr(subtotalInr)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Coin list price</span>
              <span>{formatCoin(subtotalCoins)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatInr(shipping)}</span>
            </p>
            <p className="border-border flex justify-between border-t pt-2 font-semibold">
              <span>Coins used</span>
              <span>{formatCoin(preview.coinAmount)}</span>
            </p>
            <p className="flex justify-between font-semibold">
              <span>Cash due</span>
              <span>{formatInr(preview.cashAmountInr)}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
