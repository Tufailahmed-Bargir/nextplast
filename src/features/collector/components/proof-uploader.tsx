"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/validations/collector";
import { uploadProofAction } from "@/features/collector/actions/collector-actions";
import { cn } from "@/lib/utils";

interface ProofUploaderProps {
  pickupId: string;
  proofUrl?: string | null;
  onUploaded: (proof: { url: string; publicId: string }) => void;
  disabled?: boolean;
}

/**
 * Proof photo uploader for completed pickups (Cloudinary).
 */
export function ProofUploader({
  pickupId,
  proofUrl,
  onUploaded,
  disabled,
}: ProofUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);

  function onSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
      )
    ) {
      toast.error("Only JPEG, PNG, and WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Each image must be under 10 MB.");
      return;
    }

    startTransition(async () => {
      try {
        setProgress("Uploading proof…");
        const formData = new FormData();
        formData.set("pickupId", pickupId);
        formData.set("file", file);
        const result = await uploadProofAction(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Proof uploaded");
        onUploaded(result.data);
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8",
          "hover:border-sky-400 hover:bg-muted/40",
        )}
      >
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {progress ?? "Upload proof photo"}
        </p>
        <p className="text-xs text-muted-foreground">JPEG, PNG, or WEBP</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => onSelect(e.target.files)}
      />
      {proofUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
          <Image
            src={proofUrl}
            alt="Pickup proof"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
            unoptimized
          />
        </div>
      ) : null}
    </div>
  );
}
