"use client";

import { useCallback, useState, useTransition } from "react";

/**
 * useTransition that remembers which action is running, so every control can
 * stay disabled while only the one the user clicked shows a spinner.
 */
export function usePendingAction() {
  const [pending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const run = useCallback((key: string, action: () => Promise<void>) => {
    setActiveKey(key);
    startTransition(async () => {
      try {
        await action();
      } finally {
        setActiveKey(null);
      }
    });
  }, []);

  const isRunning = useCallback(
    (key: string) => pending && activeKey === key,
    [pending, activeKey],
  );

  return { pending, run, isRunning };
}
