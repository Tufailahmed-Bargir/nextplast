import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ src, name, size = 'md', className, ring = false }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], ring && 'ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-surface', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white bg-eco-gradient',
        sizes[size],
        ring && 'ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-surface',
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
