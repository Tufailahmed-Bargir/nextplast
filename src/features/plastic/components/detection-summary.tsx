"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BoundingBoxViewer } from "@/features/ai/components/bounding-box-viewer";

export interface DetectionView {
  id: string;
  listingImageId: string | null;
  detectedClass: string;
  detectedCount: number;
  userConfirmedCount: number | null;
  userConfirmedClass: string | null;
  confidence: number;
  decision: string;
  matchedClaimed?: boolean | null;
  imageUrl?: string | null;
  boxes?: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    confidence: number;
  }[];
  fraudAlerts?: { code: string; message: string; severity: string }[];
}

interface DetectionSummaryProps {
  detections: DetectionView[];
  editable?: boolean;
  onEditChange?: (
    edits: {
      detectionId: string;
      userConfirmedCount: number;
      userConfirmedClass: string;
    }[],
  ) => void;
}

type EditMap = Record<string, { count: number; className: string }>;

function buildEdits(detections: DetectionView[]): EditMap {
  return Object.fromEntries(
    detections.map((d) => [
      d.id,
      {
        count: d.userConfirmedCount ?? d.detectedCount,
        className: d.userConfirmedClass ?? d.detectedClass,
      },
    ]),
  );
}

function toEditList(edits: EditMap) {
  return Object.entries(edits).map(([detectionId, value]) => ({
    detectionId,
    userConfirmedCount: value.count,
    userConfirmedClass: value.className,
  }));
}

/**
 * AI detection summary with optional review/edit controls and bbox overlays.
 */
export function DetectionSummary({
  detections,
  editable = false,
  onEditChange,
}: DetectionSummaryProps) {
  const detectionKey = detections.map((d) => d.id).join("|");
  const [edits, setEdits] = useState<EditMap>(() => buildEdits(detections));

  // Reset local edits when the detection set changes (new AI run).
  useEffect(() => {
    setEdits(buildEdits(detections));
  }, [detectionKey]); // eslint-disable-line react-hooks/exhaustive-deps -- keyed by detection ids

  // Notify parent after commit — never call parent setState inside setState updater.
  useEffect(() => {
    if (!editable) return;
    onEditChange?.(toEditList(edits));
  }, [edits, editable, onEditChange]);

  const avgConfidence = useMemo(() => {
    if (detections.length === 0) return 0;
    return (
      detections.reduce((s, d) => s + d.confidence, 0) / detections.length
    );
  }, [detections]);

  const alerts = detections.flatMap((d) => d.fraudAlerts ?? []);

  function updateEdit(
    id: string,
    patch: Partial<{ count: number; className: string }>,
  ) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, ...patch },
    }));
  }

  if (detections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Run AI detection to see plastic types, counts, and confidence scores.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {Math.round(avgConfidence * 100)}% avg confidence
        </Badge>
        {alerts.length === 0 ? (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> Fraud checks clear
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" /> {alerts.length} alert(s)
          </span>
        )}
      </div>

      {alerts.length > 0 ? (
        <ul className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          {alerts.map((alert, i) => (
            <li key={`${alert.code}-${i}`} className="text-amber-800 dark:text-amber-200">
              <strong>{alert.code}</strong>: {alert.message}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {detections.map((detection) => (
          <div
            key={detection.id}
            className="overflow-hidden rounded-xl border border-border"
          >
            {detection.imageUrl ? (
              <BoundingBoxViewer
                imageUrl={detection.imageUrl}
                boxes={detection.boxes ?? []}
              />
            ) : null}
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">{detection.detectedClass}</Badge>
                <span className="text-muted-foreground">
                  AI count: {detection.detectedCount}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(detection.confidence * 100)}% ·{" "}
                  {detection.decision.toLowerCase()}
                </span>
              </div>
              {editable ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`class-${detection.id}`}>Confirmed type</Label>
                    <Input
                      id={`class-${detection.id}`}
                      value={edits[detection.id]?.className ?? ""}
                      onChange={(e) =>
                        updateEdit(detection.id, { className: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`count-${detection.id}`}>Confirmed qty</Label>
                    <Input
                      id={`count-${detection.id}`}
                      type="number"
                      min={0}
                      value={edits[detection.id]?.count ?? 0}
                      onChange={(e) =>
                        updateEdit(detection.id, {
                          count: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p
                  className={cn(
                    "text-sm",
                    detection.matchedClaimed === false && "text-amber-600",
                  )}
                >
                  Confirmed: {detection.userConfirmedClass ?? detection.detectedClass}{" "}
                  × {detection.userConfirmedCount ?? detection.detectedCount}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
