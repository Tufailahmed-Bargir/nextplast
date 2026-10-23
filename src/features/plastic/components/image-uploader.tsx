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
  prepareListingUploadAction,
  removeListingImageAction,
  saveListingImagesAction,
  uploadListingImagesAction,
} from "@/features/plastic/actions/sell-actions";
import {
  mapWithConcurrency,
  uploadToCloudinary,
} from "@/features/plastic/lib/direct-upload";
import { CameraCaptureDialog } from "@/features/plastic/components/camera-capture-dialog";
import { cn } from "@/lib/utils";
import { compressImage } from "@/utils/compress-image";
import { optimizedImageUrl } from "@/utils/cloudinary-url";

const UPLOAD_CONCURRENCY = 3;
/** Raw photo limit before compression; the 10 MB cap applies after. */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

interface PendingUpload {
  id: string;
  previewUrl: string;
  progress: number;
}

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
 * Multi-image uploader with camera capture, preview, validation, compression, and progress.
 * Photos are compressed in the browser and uploaded straight to Cloudinary,
 * a few at a time, with the server action path kept as a fallback.
 */
export function ImageUploader({
  listingId,
  images,
  onChanged,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [pending, startTransition] = useTransition();

  function validateFiles(files: File[]): string | null {
    if (images.length + files.length > MAX_IMAGES_PER_LISTING) {
      return `You can upload up to ${MAX_IMAGES_PER_LISTING} images.`;
    }
    for (const file of files) {
      // Some Android cameras report no MIME type; compression re-encodes those.
      if (
        file.type !== "" &&
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
        )
      ) {
        return "Only JPEG, PNG, and WEBP images are allowed.";
      }
      if (file.size > MAX_SOURCE_BYTES) {
        return "Each photo must be under 25 MB.";
      }
    }
    return null;
  }

  function onSelect(fileList: FileList | File[] | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const error = validateFiles(files);
    if (error) {
      toast.error(error);
      return;
    }

    // Show the photos immediately; they fill in as each upload finishes.
    const items: PendingUpload[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    }));
    setUploads(items);
    const setItemProgress = (id: string, value: number) =>
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, progress: value } : u)),
      );

    startTransition(async () => {
      try {
        setProgress(`Uploading ${files.length} photo(s)…`);
        // Signing and compression overlap so neither waits on the other.
        const [ticket, compressed] = await Promise.all([
          prepareListingUploadAction({ listingId, count: files.length }),
          Promise.all(files.map((file) => compressImage(file))),
        ]);
        if (!ticket.success) {
          toast.error(ticket.error);
          return;
        }
        if (compressed.some((file) => file.size > MAX_IMAGE_BYTES)) {
          toast.error("Each image must be under 10 MB.");
          return;
        }

        const settled = await mapWithConcurrency(
          compressed,
          UPLOAD_CONCURRENCY,
          (file, index) =>
            uploadToCloudinary(file, ticket.data, (fraction) =>
              setItemProgress(items[index]!.id, fraction),
            ),
        );

        let uploaded = 0;
        const direct = settled.flatMap((s) =>
          s.status === "fulfilled" ? [s.value] : [],
        );
        if (direct.length > 0) {
          const saved = await saveListingImagesAction({
            listingId,
            images: direct,
          });
          if (!saved.success) {
            toast.error(saved.error);
            return;
          }
          uploaded += saved.data.uploaded;
        }

        // Anything the direct path could not send goes through our server instead.
        const retry = compressed.filter(
          (_, index) => settled[index]!.status === "rejected",
        );
        for (const file of retry) {
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
        items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setUploads([]);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      }
    });
  }

  function openCamera() {
    // Phones and tablets open their native camera straight from the file input;
    // desktops need the in-page live camera.
    const prefersNativeCamera = window.matchMedia("(pointer: coarse)").matches;
    if (prefersNativeCamera) {
      cameraInputRef.current?.click();
    } else {
      setCameraOpen(true);
    }
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
      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs uppercase">or</span>
        <span className="bg-border h-px flex-1" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled || pending}
        onClick={openCamera}
      >
        <Camera className="h-4 w-4" /> Take photo with camera
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => onSelect(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onSelect(e.target.files)}
      />
      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(file) => onSelect([file])}
        onUseUpload={() => inputRef.current?.click()}
      />

      {images.length > 0 || uploads.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group border-border relative overflow-hidden rounded-xl border"
            >
              <div className="bg-muted relative aspect-video">
                <Image
                  src={optimizedImageUrl(image.url, 600)}
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
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="border-border relative overflow-hidden rounded-xl border"
            >
              <div className="bg-muted relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img
                  src={upload.previewUrl}
                  alt="Uploading plastic photo"
                  className="h-full w-full object-cover opacity-70"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white drop-shadow" />
                </div>
              </div>
              <div
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(upload.progress * 100)}
                className="bg-muted absolute inset-x-0 bottom-0 h-1"
              >
                <div
                  className="h-full bg-emerald-500 transition-[width] duration-200"
                  style={{ width: `${Math.max(5, upload.progress * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
