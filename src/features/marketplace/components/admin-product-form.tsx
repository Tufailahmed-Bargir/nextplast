"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  seedMarketplaceCatalogAction,
  upsertAdminProductAction,
} from "@/features/marketplace/actions/marketplace-actions";
import { inrToNatureCoins } from "@/utils/coin";
import { cn } from "@/lib/utils";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface AdminProductFormProps {
  categories: { id: string; name: string }[];
  /** Prefill from an OPEN product request (`?requestId=`). */
  requestPrefill?: {
    id: string;
    title: string;
    description: string;
    requesterName: string | null;
    requesterEmail: string;
    requesterRole: string;
  } | null;
}

export function AdminProductForm({
  categories,
  requestPrefill = null,
}: AdminProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: requestPrefill?.title ?? "",
    slug: requestPrefill ? slugify(requestPrefill.title) : "",
    description: requestPrefill?.description ?? "",
    categoryId: categories[0]?.id ?? "",
    priceInr: "499",
    stock: "20",
    ecoScore: "80",
    materials: "Recycled PET",
    imageUrl: "",
  });

  const derivedCoins = inrToNatureCoins(Number(form.priceInr) || 0);

  function save() {
    startTransition(async () => {
      const priceInr = Number(form.priceInr);
      const autoSlug = slugify(form.name);
      const slug =
        form.slug.trim().length >= 2 ? slugify(form.slug) : autoSlug;
      if (slug.length < 2) {
        toast.error("Name/slug must be at least 2 characters (e.g. eco-pen).");
        return;
      }
      const result = await upsertAdminProductAction({
        name: form.name,
        slug,
        description: form.description || undefined,
        categoryId: form.categoryId,
        priceInr,
        priceCoins: inrToNatureCoins(priceInr),
        stock: Number(form.stock),
        ecoScore: form.ecoScore ? Number(form.ecoScore) : undefined,
        materials: form.materials
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl || undefined,
        isActive: true,
        requestId: requestPrefill?.id,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setForm((f) => ({
        ...f,
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        priceInr: "499",
        stock: "20",
      }));
      if (requestPrefill) {
        router.push("/admin/product-requests");
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  function seed() {
    startTransition(async () => {
      const result = await seedMarketplaceCatalogAction();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            {requestPrefill
              ? "Fulfill product request"
              : "Add product to marketplace"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {requestPrefill ? (
            <div className="sm:col-span-2 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
              <p className="font-medium text-foreground">
                Request from {requestPrefill.requesterName ?? "User"} (
                {requestPrefill.requesterEmail})
              </p>
              <p className="text-xs text-muted-foreground">
                Role:{" "}
                {requestPrefill.requesterRole.replaceAll("_", " ").toLowerCase()}
              </p>
              <Link
                href="/admin/product-requests"
                className="text-xs font-medium text-primary hover:underline"
              >
                Back to requests
              </Link>
            </div>
          ) : null}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => {
                  const prevAuto = slugify(f.name);
                  const keepManual =
                    f.slug.length > 0 && f.slug !== prevAuto;
                  return {
                    ...f,
                    name,
                    slug: keepManual ? f.slug : slugify(name),
                  };
                });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: slugify(e.target.value) })
              }
              placeholder="eco-pen"
            />
            <p className="text-xs text-muted-foreground">
              URL id — auto from name. Min 2 chars (e.g. eco-pen).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price ₹</Label>
            <Input
              type="number"
              value={form.priceInr}
              onChange={(e) => setForm({ ...form, priceInr: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price coins (auto)</Label>
            <Input type="number" value={String(derivedCoins)} readOnly />
            <p className="text-xs text-muted-foreground">
              1 Nature Coin ≈ ₹0.50 → coins = ₹ price × 2
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Stock</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Eco score</Label>
            <Input
              type="number"
              value={form.ecoScore}
              onChange={(e) => setForm({ ...form, ecoScore: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Materials (comma-separated)</Label>
            <Input
              value={form.materials}
              onChange={(e) => setForm({ ...form, materials: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Image URL</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <Button
            type="button"
            disabled={pending || !form.categoryId}
            onClick={save}
            className="sm:col-span-2"
          >
            {pending
              ? "Saving…"
              : requestPrefill
                ? "Create & notify requester"
                : "Add product to marketplace"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Starter catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            If the catalog is empty, seed baseline eco products into Prisma
            (idempotent — skips when products already exist).
          </p>
          <Button type="button" variant="outline" disabled={pending} onClick={seed}>
            Seed starter catalog
          </Button>
          {requestPrefill ? (
            <Link
              href="/admin/product-requests"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Cancel fulfill
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
