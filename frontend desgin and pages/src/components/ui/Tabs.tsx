import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 rounded-xl bg-surface-muted border border-base', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            active === tab.id
              ? 'bg-surface text-base-strong shadow-soft'
              : 'text-base-muted hover:text-base-strong'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface SegmentedProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function Segmented({ options, value, onChange, className }: SegmentedProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 rounded-xl bg-surface-muted border border-base', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
            value === opt.value
              ? 'bg-surface text-base-strong shadow-soft'
              : 'text-base-muted hover:text-base-strong'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
