"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { id: string; url: string; isPrimary: boolean }[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const list =
    images.length > 0
      ? images
      : [{ id: "placeholder", url: "", isPrimary: true }];
  const current = list[Math.min(active, list.length - 1)]!;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "bg-muted/40 relative aspect-square overflow-hidden rounded-2xl",
          zoomed && "cursor-zoom-out",
        )}
        onClick={() => current.url && setZoomed((z) => !z)}
      >
        {current.url ? (
          <Image
            src={current.url}
            alt={name}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              zoomed && "scale-150",
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            No image
          </div>
        )}
      </div>
      {list.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {list.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border",
                idx === active ? "border-emerald-500" : "border-border",
              )}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
