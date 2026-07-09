import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-card border border-surface-border bg-surface p-6 shadow-card', className)}>
      {children}
    </div>
  );
}
