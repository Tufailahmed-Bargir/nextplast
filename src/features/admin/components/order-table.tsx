"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/features/admin/components/search-bar";
import { FilterPanel } from "@/features/admin/components/filter-panel";
import { formatCoin, formatNumber } from "@/utils/coin";
import { formatRelative } from "@/utils/date";

export interface OrderTableRow {
  id: string;
  status: string;
  paymentMode: string;
  cashAmountInr: number;
  coinAmount: number;
  userName: string;
  itemCount: number;
  createdAt: Date;
}

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING_PAYMENT", label: "Pending payment" },
  { id: "PROCESSING", label: "Processing" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "REFUNDED", label: "Refunded" },
];

interface OrderTableProps {
  orders: OrderTableRow[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!term) return true;
      return (
        o.id.toLowerCase().includes(term) ||
        o.userName.toLowerCase().includes(term)
      );
    });
  }, [orders, q, status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <p className="text-sm text-muted-foreground">
          Marketplace orders from Prisma — cash, coins, and hybrid checkouts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar value={q} onChange={setQ} placeholder="Search order id…" />
          <FilterPanel
            options={STATUS_FILTERS}
            value={status}
            onChange={setStatus}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    #{o.id.slice(0, 8)} · {o.userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.itemCount} item(s) · {o.paymentMode} ·{" "}
                    {formatRelative(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {o.status.toLowerCase().replaceAll("_", " ")}
                  </Badge>
                  <span>
                    ₹{formatNumber(Math.round(o.cashAmountInr))} ·{" "}
                    {formatCoin(o.coinAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
