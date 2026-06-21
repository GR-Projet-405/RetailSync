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
          "w-full pl-9 pr-4 py-2 text-sm bg-slate-950/40 hover:bg-slate-950/60 focus:bg-slate-950/80 text-slate-100 rounded-lg border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500",
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
