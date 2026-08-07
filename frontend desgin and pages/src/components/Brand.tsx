import { cn } from '@/lib/utils';

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size} className="drop-shadow-sm">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#logoGrad)" />
          <circle cx="20" cy="20" r="18" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M20 10 C 14 14, 14 20, 20 22 C 26 20, 26 26, 20 30" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="10" r="1.5" fill="white" />
          <circle cx="20" cy="30" r="1.5" fill="white" />
        </svg>
      </div>
      <span className="font-display text-xl font-bold tracking-tight text-base-strong">
        Nex<span className="gradient-text">Plast</span>
      </span>
    </div>
  );
}

export function CoinIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#coinGrad)" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#b45309" strokeOpacity="0.3" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="#92400e" strokeOpacity="0.25" strokeWidth="0.5" />
      <path d="M12 7 L13.2 10.5 L17 10.5 L13.9 12.8 L15.1 16.5 L12 14.2 L8.9 16.5 L10.1 12.8 L7 10.5 L10.8 10.5 Z" fill="#92400e" fillOpacity="0.5" />
    </svg>
  );
}
