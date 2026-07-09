import { cn } from '../../lib/cn';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-status-info/10 text-status-info',
  POST: 'bg-status-success/10 text-status-success',
  PUT: 'bg-status-warning/10 text-status-warning',
  PATCH: 'bg-status-warning/10 text-status-warning',
  DELETE: 'bg-status-error/10 text-status-error',
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide font-mono',
        METHOD_COLORS[method] ?? 'bg-surface text-content-secondary'
      )}
    >
      {method}
    </span>
  );
}

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'brand' | 'success' | 'muted' }) {
  const tones: Record<string, string> = {
    default: 'bg-surface text-content-secondary border-surface-border',
    brand: 'bg-brand-muted text-brand border-transparent',
    success: 'bg-status-success/10 text-status-success border-transparent',
    muted: 'bg-white/5 text-content-muted border-transparent',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}
