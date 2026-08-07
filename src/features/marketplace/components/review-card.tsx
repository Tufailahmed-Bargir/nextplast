import { Star } from "lucide-react";
import { formatRelative } from "@/utils/date";

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  userName: string;
  createdAt: Date;
}

export function ReviewCard({
  rating,
  comment,
  userName,
  createdAt,
}: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{userName}</p>
        <span className="text-xs text-muted-foreground">
          {formatRelative(createdAt)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
      {comment ? (
        <p className="mt-2 text-sm text-muted-foreground">{comment}</p>
      ) : null}
    </div>
  );
}
