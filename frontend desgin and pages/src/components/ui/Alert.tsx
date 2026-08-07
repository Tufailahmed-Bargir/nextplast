import { cn } from '@/lib/utils';

type Variant = 'info' | 'success' | 'warning' | 'error' | 'coin';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  icon?: React.ReactNode;
  title?: string;
}

const styles: Record<Variant, { bg: string; border: string; text: string; icon: string }> = {
  info: { bg: 'bg-sky-50 dark:bg-sky-950/40', border: 'border-sky-200 dark:border-sky-900', text: 'text-sky-800 dark:text-sky-200', icon: 'text-sky-500' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-800 dark:text-emerald-200', icon: 'text-emerald-500' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-800 dark:text-amber-200', icon: 'text-amber-500' },
  error: { bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-900', text: 'text-red-800 dark:text-red-200', icon: 'text-red-500' },
  coin: { bg: 'bg-coin-50 dark:bg-coin-950/40', border: 'border-coin-200 dark:border-coin-900', text: 'text-coin-800 dark:text-coin-200', icon: 'text-coin-500' },
};

export function Alert({ variant = 'info', icon, title, className, children, ...props }: AlertProps) {
  const s = styles[variant];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-4', s.bg, s.border, s.text, className)} {...props}>
      {icon && <span className={cn('mt-0.5 shrink-0', s.icon)}>{icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
    </div>
  );
}
