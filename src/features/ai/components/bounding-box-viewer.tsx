import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BoxOverlay {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
}

interface BoundingBoxViewerProps {
  imageUrl: string;
  boxes: BoxOverlay[];
  alt?: string;
  className?: string;
}

/** Server-friendly bounding-box overlay (no client JS required). */
export function BoundingBoxViewer({
  imageUrl,
  boxes,
  alt = "Detection",
  className,
}: BoundingBoxViewerProps) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        unoptimized
      />
      {boxes.map((box, i) => (
        <div
          key={`${box.label}-${i}`}
          className="absolute rounded-md border-2 border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
          }}
        >
          <span className="absolute -top-6 left-0 rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
            {box.label} {Math.round(box.confidence * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}
