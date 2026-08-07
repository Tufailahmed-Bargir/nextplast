import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, barClassName, size = 'md', showLabel = false }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-surface-muted overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full bg-eco-gradient transition-all duration-700 ease-out', barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-base-muted mt-1 block">{pct}%</span>}
    </div>
  );
}

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}

export function Ring({ value, size = 120, stroke = 10, className, label, sublabel }: RingProps) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, value) / 100) * circ;
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-muted" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={stroke}
          stroke="url(#ecoGrad)" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ecoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-display text-2xl font-bold text-base-strong">{label}</span>}
        {sublabel && <span className="text-xs text-base-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
