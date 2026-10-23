"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adjustWalletAction } from "@/features/admin/actions/admin-actions";
import { formatCoin } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";

export interface WalletTableRow {
  id: string;
  type: string;
  status: string;
  amount: number;
  userName: string;
  userId: string;
  title: string | null;
  createdAt: Date;
}

interface WalletTableProps {
  transactions: WalletTableRow[];
  users: { id: string; label: string }[];
}

export function WalletTable({ transactions, users }: WalletTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await adjustWalletAction({
        userId,
        amount: Number(amount),
        reason,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setAmount("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet adjustment</CardTitle>
          <p className="text-muted-foreground text-sm">
            Manual Nature Coin adjust with audit log (server-side only).
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select
            className="border-input h-10 rounded-lg border bg-transparent px-3 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <Input
            type="number"
            step="0.01"
            placeholder="Amount (+ credit / − debit)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Textarea
            className="md:col-span-2"
            placeholder="Reason (min 5 characters, e.g. Demo credit for viva)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="text-muted-foreground text-xs md:col-span-2">
            Reason is required (≥ 5 characters) so every manual coin change is
            auditable.
          </p>
          <Button
            type="button"
            disabled={!userId}
            loading={pending}
            onClick={submit}
          >
            Apply adjustment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent wallet activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No transactions yet.
            </p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {tx.userName} · {tx.title ?? tx.type}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(tx.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{tx.type.toLowerCase()}</Badge>
                  <span className="coin-text font-semibold">
                    {formatCoin(tx.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
