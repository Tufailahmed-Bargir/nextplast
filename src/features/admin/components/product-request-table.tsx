"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ProductRequestStatus, UserRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rejectProductRequestAction } from "@/features/admin/actions/admin-actions";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/lib/utils";

export interface ProductRequestRow {
  id: string;
  title: string;
  description: string;
  status: ProductRequestStatus;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  };
  fulfilledProduct: { id: string; name: string; slug: string } | null;
}

interface ProductRequestTableProps {
  requests: ProductRequestRow[];
}

export function ProductRequestTable({ requests }: ProductRequestTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function reject(requestId: string) {
    startTransition(async () => {
      const result = await rejectProductRequestAction({ requestId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Request rejected.");
      router.refresh();
    });
  }

  const open = requests.filter((r) => r.status === "OPEN");
  const others = requests.filter((r) => r.status !== "OPEN");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Open requests ({open.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open product requests right now.
            </p>
          ) : (
            open.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                pending={pending}
                onReject={() => reject(request.id)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {others.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {others.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border/60 p-3 text-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium">{request.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.user.name ?? "User"} · {request.user.email} ·{" "}
                    {request.user.role.toLowerCase()}
                  </p>
                  {request.fulfilledProduct ? (
                    <Link
                      href={`/marketplace/${request.fulfilledProduct.slug}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Listed: {request.fulfilledProduct.name}
                    </Link>
                  ) : null}
                </div>
                <Badge variant="secondary">
                  {request.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function RequestCard({
  request,
  pending,
  onReject,
}: {
  request: ProductRequestRow;
  pending: boolean;
  onReject: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">open</Badge>
        <span className="text-sm font-semibold">{request.title}</span>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {request.description}
      </p>
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">
            {request.user.name ?? "User"}
          </span>{" "}
          · {request.user.email}
        </p>
        <p>
          Role: {request.user.role.replaceAll("_", " ").toLowerCase()} ·{" "}
          {formatDateTime(
            typeof request.createdAt === "string"
              ? new Date(request.createdAt)
              : request.createdAt,
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/products?requestId=${request.id}`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Create product
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
