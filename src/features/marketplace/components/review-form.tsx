"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewAction } from "@/features/marketplace/actions/marketplace-actions";

interface ReviewFormProps {
  productId: string;
  canReview: boolean;
}

export function ReviewForm({ productId, canReview }: ReviewFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!canReview) {
    return (
      <p className="text-muted-foreground text-sm">
        Only verified buyers with a delivered order can submit reviews for this
        product.
      </p>
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await submitReviewAction({
        productId,
        rating,
        comment: comment || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setComment("");
      router.refresh();
    });
  }

  return (
    <div className="border-border space-y-3 rounded-xl border p-4">
      <p className="font-medium">Write a review</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-9 w-9 rounded-lg border text-sm font-semibold ${
              rating >= n
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-border"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your experience…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="button" loading={pending} onClick={submit}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </div>
  );
}
