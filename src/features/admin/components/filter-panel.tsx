"use client";

import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterPanelProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterPanel({ options, value, onChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm transition-colors",
              active
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : "border-border hover:bg-muted/50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
