"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Check,
  Loader2,
  RotateCcw,
  SwitchCamera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FacingMode = "environment" | "user";

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  onUseUpload: () => void;
}

function cameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access was blocked. Allow camera permission in your browser and try again.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found on this device.";
  }
  if (name === "NotReadableError") {
    return "The camera is being used by another app. Close it and try again.";
  }
  return "Could not start the camera.";
}

/**
 * Live camera capture for devices where the file input can't open the camera directly.
 */
export function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  onUseUpload,
}: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [captured, setCaptured] = useState<{ file: File; url: string } | null>(
    null,
  );

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || captured) return;

    let cancelled = false;
    async function start() {
      setStarting(true);
      setError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new DOMException("Unsupported", "NotFoundError");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setCanSwitch(
            devices.filter((d) => d.kind === "videoinput").length > 1,
          );
        }
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err));
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, captured, facingMode, stopStream]);

  useEffect(() => {
    return () => {
      if (captured) URL.revokeObjectURL(captured.url);
    };
  }, [captured]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      stopStream();
      setCaptured(null);
      setError(null);
    }
    onOpenChange(next);
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture the photo. Try again.");
          return;
        }
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stopStream();
        setCaptured({ file, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.9,
    );
  }

  function confirmPhoto() {
    if (!captured) return;
    onCapture(captured.file);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Take a photo</DialogTitle>
          <DialogDescription>
            Fit all the plastic items in the frame with good lighting.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
          {captured ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              src={captured.url}
              alt="Captured plastic photo"
              className="h-full w-full object-contain"
            />
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <CameraOff className="text-muted-foreground h-8 w-8" />
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleOpenChange(false);
                  onUseUpload();
                }}
              >
                Upload from device instead
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
                aria-label="Camera preview"
              />
              {starting ? (
                <div className="bg-muted/80 absolute inset-0 flex items-center justify-center">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  <span className="sr-only">Starting camera</span>
                </div>
              ) : null}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {captured ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCaptured(null)}
              >
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
              <Button type="button" onClick={confirmPhoto}>
                <Check className="h-4 w-4" /> Use photo
              </Button>
            </>
          ) : (
            <>
              {canSwitch ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={starting || Boolean(error)}
                  onClick={() =>
                    setFacingMode((m) =>
                      m === "environment" ? "user" : "environment",
                    )
                  }
                >
                  <SwitchCamera className="h-4 w-4" /> Switch camera
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="button"
                disabled={starting || Boolean(error)}
                onClick={capture}
              >
                <Camera className="h-4 w-4" /> Capture
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
