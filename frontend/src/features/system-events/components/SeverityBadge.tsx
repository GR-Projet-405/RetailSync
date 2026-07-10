import { cn } from '../../../utils/cn';
import type { EventSeverity } from '../types';

const SEVERITY_STYLES: Record<EventSeverity, string> = {
  CRITICAL: 'bg-red-700 text-white border-red-800',
  ERROR: 'bg-red-50 text-red-700 border-red-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  INFO: 'bg-blue-50 text-blue-600 border-blue-100',
};

interface SeverityBadgeProps {
  severity: EventSeverity;
  className?: string;
}

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border uppercase',
        SEVERITY_STYLES[severity],
        className
      )}
    >
      {severity}
    </span>
  );
}
