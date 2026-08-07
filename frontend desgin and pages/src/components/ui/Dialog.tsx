import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-md bg-surface border border-base rounded-2xl shadow-float animate-scale-in',
          className
        )}
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            {title && <h2 className="font-display text-xl font-bold text-base-strong">{title}</h2>}
            {description && <p className="text-sm text-base-muted mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-base-muted hover:bg-surface-subtle hover:text-base-strong transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 pb-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
