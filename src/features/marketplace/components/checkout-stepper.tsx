import { cn } from "@/lib/utils";

const STEPS = [
  { id: "address", label: "Address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
] as const;

export type CheckoutStepId = (typeof STEPS)[number]["id"];

interface CheckoutStepperProps {
  current: CheckoutStepId;
}

export function CheckoutStepper({ current }: CheckoutStepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold",
              index === currentIdx
                ? "bg-emerald-600 text-white"
                : index < currentIdx
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "hidden text-sm font-medium sm:inline",
              index === currentIdx ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
          {index < STEPS.length - 1 ? (
            <div className="mx-1 h-px flex-1 bg-border" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
