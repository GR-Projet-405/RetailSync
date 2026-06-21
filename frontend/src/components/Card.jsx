import { cn } from '../utils/cn';

export const Card = ({ className, hover = false, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]',
      hover && 'card-hover',
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-base font-semibold leading-none tracking-tight text-[#0F172A]', className)} {...props} />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-[#64748B]', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0 border-t border-slate-200 mt-4', className)} {...props} />
);

export default Card;
