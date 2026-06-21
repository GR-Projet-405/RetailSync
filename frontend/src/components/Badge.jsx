import { cn } from '../utils/cn';

export const Badge = ({ children, variant = 'primary', className }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';

  const variants = {
    primary:   'bg-blue-50    text-blue-700    border-blue-200',
    secondary: 'bg-sky-50     text-sky-700     border-sky-200',
    success:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning:   'bg-amber-50   text-amber-700   border-amber-200',
    danger:    'bg-red-50     text-red-700     border-red-200',
    info:      'bg-blue-50    text-blue-600    border-blue-100',
    neutral:   'bg-slate-100  text-slate-600   border-slate-200',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
};

// Semantic alias for use in tables / audit logs
export const StatusBadge = Badge;

export default Badge;
