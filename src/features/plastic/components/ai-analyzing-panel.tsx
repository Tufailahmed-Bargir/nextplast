"use client";

import { useEffect, useState } from "react";
import { Loader2, Scan } from "lucide-react";

const STAGES = [
  "Uploading photos to the AI model…",
  "Detecting plastic items…",
  "Classifying plastic types…",
  "Estimating quantity and weight…",
  "Checking image quality and duplicates…",
] as const;

const STAGE_INTERVAL_MS = 2_500;

interface AiAnalyzingPanelProps {
  imageCount: number;
}

/**
 * In-progress state for AI detection so users can see work is happening.
 */
export function AiAnalyzingPanel({ imageCount }: AiAnalyzingPanelProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, STAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60">
          <Scan className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-medium">
            Analyzing {imageCount} photo{imageCount === 1 ? "" : "s"}…
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{STAGES[stage]}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            This usually takes a few seconds. Please keep this page open.
          </p>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/60">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
          style={{ width: `${((stage + 1) / STAGES.length) * 90}%` }}
        />
      </div>
    </div>
  );
}
