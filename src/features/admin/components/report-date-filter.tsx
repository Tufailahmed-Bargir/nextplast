"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReportDateFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");

  function apply() {
    const next = new URLSearchParams();
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    startTransition(() => {
      router.push(`/admin/reports?${next.toString()}`);
    });
  }

  function clear() {
    setFrom("");
    setTo("");
    startTransition(() => {
      router.push("/admin/reports");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" disabled={pending} onClick={apply}>
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={clear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
