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
import { compressImage } from "@/utils/compress-image";

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
        // One request per image keeps each body under Vercel's 4.5 MB function limit.
        let uploaded = 0;
        for (const [index, file] of compressed.entries()) {
          setProgress(`Uploading image ${index + 1} of ${compressed.length}…`);
          const formData = new FormData();
          formData.set("listingId", listingId);
          formData.append("files", file);
          const result = await uploadListingImagesAction(formData);
          if (!result.success) {
            toast.error(result.error);
            break;
          }
          uploaded += result.data.uploaded;
        }
        if (uploaded > 0) {
          toast.success(`Uploaded ${uploaded} image(s)`);
          await onChanged();
        }
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
          "hover:bg-muted/40 hover:border-emerald-400",
          pending && "opacity-70",
        )}
      >
        <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
          {pending ? (
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          ) : (
            <Camera className="text-muted-foreground h-6 w-6" />
          )}
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium">
            {progress ?? "Tap to upload plastic photos"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            JPEG, PNG, or WEBP · up to 10 MB each · max {MAX_IMAGES_PER_LISTING}
          </p>
        </div>
        <span className="text-primary inline-flex items-center gap-2 text-sm font-medium">
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
              className="group border-border relative overflow-hidden rounded-xl border"
            >
              <div className="bg-muted relative aspect-video">
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
                className="absolute top-2 right-2"
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
