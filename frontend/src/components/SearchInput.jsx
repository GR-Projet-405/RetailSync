import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn';

export const SearchInput = React.forwardRef(({ className, placeholder = 'Search...', ...props }, ref) => {
  return (
    <div className="relative flex items-center w-full max-w-sm">
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        ref={ref}
        className={cn(
          'w-full pl-9 pr-4 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all duration-150 placeholder:text-slate-400',
          className
        )}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
export default SearchInput;
