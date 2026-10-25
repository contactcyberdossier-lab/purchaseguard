'use client';

// ========================================================
// Visual Deadline Countdown Badge
// ========================================================

import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { getCountdownStatus } from '@/lib/deadlines';
import { cn } from '@/lib/utils';

interface DeadlineCountdownBadgeProps {
  targetDate: string | Date | null;
  className?: string;
}

export function DeadlineCountdownBadge({ targetDate, className }: DeadlineCountdownBadgeProps) {
  const { label, severity } = getCountdownStatus(targetDate);

  const config = {
    success: {
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
    },
    warning: {
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: Clock,
    },
    danger: {
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse',
      icon: AlertTriangle,
    },
    expired: {
      color: 'bg-muted text-muted-foreground border-border',
      icon: XCircle,
    },
  }[severity];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border',
        config.color,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
