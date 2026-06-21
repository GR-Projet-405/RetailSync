import { cn } from '../utils/cn';

export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-blue-600 border-r-transparent border-b-sky-400 border-l-transparent',
        sizes[size],
        className
      )}
    />
  );
};

export default Spinner;
