import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudAlertProps {
  alerts: { code: string; message: string; severity: string }[];
  className?: string;
}

export function FraudAlert({ alerts, className }: FraudAlertProps) {
  if (alerts.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
          className,
        )}
      >
        <ShieldCheck className="h-4 w-4" />
        Fraud checks clear
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40",
        className,
      )}
    >
      {alerts.map((alert, i) => (
        <li
          key={`${alert.code}-${i}`}
          className="flex gap-2 text-amber-900 dark:text-amber-100"
        >
          {alert.severity === "high" ? (
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>
            <strong>{alert.code}</strong>: {alert.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
