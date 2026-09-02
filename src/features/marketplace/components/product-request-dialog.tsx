"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProductRequestAction } from "@/features/marketplace/actions/marketplace-actions";
import { cn } from "@/lib/utils";

interface ProductRequestDialogProps {
  authenticated: boolean;
  className?: string;
  /** Visual style for the trigger (hero sits on dark gradient). */
  variant?: "hero" | "default";
}

/**
 * Info affordance + dialog to request a product missing from the marketplace.
 */
export function ProductRequestDialog({
  authenticated,
  className,
  variant = "hero",
}: ProductRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createProductRequestAction({ title, description });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Request sent.");
      setTitle("");
      setDescription("");
      setOpen(false);
    });
  }

  const triggerClass =
    variant === "hero"
      ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20"
      : undefined;

  if (!authenticated) {
    return (
      <Link
        href="/login?callbackUrl=/marketplace"
        aria-label="Sign in to request a product"
        className={cn(triggerClass, className)}
        title="Request a product"
      >
        <Info className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Request a product"
            title="Can't find a product? Request it"
            className={cn(triggerClass, className)}
          />
        }
      >
        <Info className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a product</DialogTitle>
          <DialogDescription>
            If you don&apos;t find a product you need in the marketplace, send a
            request. We&apos;ll work to add it and notify you when it&apos;s
            listed so you can purchase it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-request-title">Product name</Label>
            <Input
              id="product-request-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Recycled PET lunch box"
              maxLength={160}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-request-desc">Description</Label>
            <Textarea
              id="product-request-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you need, size, material, or why it matters…"
              rows={4}
              maxLength={2000}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={pending || title.trim().length < 2 || description.trim().length < 10}
          >
            {pending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
