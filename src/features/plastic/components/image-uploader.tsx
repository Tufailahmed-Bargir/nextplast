"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_LISTING,
} from "@/validations/plastic";
import {
  removeListingImageAction,
  uploadListingImagesAction,
} from "@/features/plastic/actions/sell-actions";
import { cn } from "@/lib/utils";

export interface ListingImageView {
  id: string;
  url: string;
  sortOrder: number;
}

interface ImageUploaderProps {
  listingId: string;
  images: ListingImageView[];
  onChanged: () => Promise<void> | void;
  disabled?: boolean;
}

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= 1.2 * 1024 * 1024) return file;

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

/**
 * Multi-image uploader with preview, validation, compression, and progress.
 */
export function ImageUploader({
  listingId,
  images,
  onChanged,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function validateFiles(files: File[]): string | null {
    if (images.length + files.length > MAX_IMAGES_PER_LISTING) {
      return `You can upload up to ${MAX_IMAGES_PER_LISTING} images.`;
    }
    for (const file of files) {
      if (
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
        )
      ) {
        return "Only JPEG, PNG, and WEBP images are allowed.";
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return "Each image must be under 10 MB.";
      }
    }
    return null;
  }

  function onSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const error = validateFiles(files);
    if (error) {
      toast.error(error);
      return;
    }

    startTransition(async () => {
      try {
        setProgress("Compressing…");
        const compressed = await Promise.all(files.map(compressImage));
        setProgress(`Uploading ${compressed.length} image(s)…`);
        const formData = new FormData();
        formData.set("listingId", listingId);
        for (const file of compressed) {
          formData.append("files", file);
        }
        const result = await uploadListingImagesAction(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(`Uploaded ${result.data.uploaded} image(s)`);
        await onChanged();
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function removeImage(imageId: string) {
    startTransition(async () => {
      const result = await removeListingImageAction({ listingId, imageId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      await onChanged();
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors",
          "hover:border-emerald-400 hover:bg-muted/40",
          pending && "opacity-70",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          {pending ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">
            {progress ?? "Tap to upload plastic photos"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            JPEG, PNG, or WEBP · up to 10 MB each · max {MAX_IMAGES_PER_LISTING}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Upload className="h-4 w-4" /> Choose files
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => onSelect(e.target.files)}
      />

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl border border-border"
            >
              <div className="relative aspect-video bg-muted">
                <Image
                  src={image.url}
                  alt="Plastic upload"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute right-2 top-2"
                disabled={pending || disabled}
                onClick={() => removeImage(image.id)}
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
