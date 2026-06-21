import React from 'react';
import { cn } from '../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm',
    outline:   'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
    ghost:     'hover:bg-slate-100 text-slate-600',
    danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
