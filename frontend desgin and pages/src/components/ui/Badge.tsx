import { cn } from '@/lib/utils';

type Variant = 'default' | 'emerald' | 'teal' | 'sky' | 'coin' | 'red' | 'amber' | 'slate';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
}

const styles: Record<Variant, string> = {
  default: 'bg-surface-muted text-base-muted',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  coin: 'bg-coin-50 text-coin-700 dark:bg-coin-950 dark:text-coin-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const dots: Record<Variant, string> = {
  default: 'bg-slate-400',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  sky: 'bg-sky-500',
  coin: 'bg-coin-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-500',
};

export function Badge({ variant = 'default', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap',
        styles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dots[variant])} />}
      {children}
    </span>
  );
}
