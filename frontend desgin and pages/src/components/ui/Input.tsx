import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, error, icon, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-base-strong mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={cn(
            'w-full h-11 rounded-xl border border-base bg-surface-subtle px-3.5 text-sm text-base-strong placeholder:text-base-muted transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
            icon ? 'pl-10' : '',
            error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-base-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-base-strong mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full rounded-xl border border-base bg-surface-subtle p-3.5 text-sm text-base-strong placeholder:text-base-muted transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none',
          className
        )}
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-base-muted">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-base-strong mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full h-11 rounded-xl border border-base bg-surface-subtle px-3.5 text-sm text-base-strong transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
