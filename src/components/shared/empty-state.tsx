import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Reusable empty-state panel for routes whose domain UI ships in a later module.
 * Keeps layouts navigable without temporary placeholder copy.
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="animate-fade-in border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
