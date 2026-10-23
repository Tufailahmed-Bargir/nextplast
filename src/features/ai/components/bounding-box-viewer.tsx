import { cn } from "@/lib/utils";
import { optimizedImageUrl } from "@/utils/cloudinary-url";

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

/**
 * Bounding-box overlay sized to the image itself so normalized box
 * coords align with the bottles the user sees (no object-cover crop).
 */
export function BoundingBoxViewer({
  imageUrl,
  boxes,
  alt = "Detection",
  className,
}: BoundingBoxViewerProps) {
  return (
    <div
      className={cn(
        "bg-muted relative w-full overflow-hidden rounded-xl",
        className,
      )}
    >
      {/* Native img: wrapper height follows image aspect → box % coords stay correct */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimizedImageUrl(imageUrl, 1200)}
        alt={alt}
        className="block h-auto w-full"
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
          {/* Boxes touching the top edge keep their label inside so it isn't clipped. */}
          <span
            className={cn(
              "absolute left-0 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] leading-tight font-semibold whitespace-nowrap text-white sm:px-2 sm:text-xs",
              box.y < 0.08 ? "top-0" : "-top-5 sm:-top-6",
            )}
          >
            {box.label}
            <span className="hidden sm:inline">
              {" "}
              {Math.round(box.confidence * 100)}%
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
