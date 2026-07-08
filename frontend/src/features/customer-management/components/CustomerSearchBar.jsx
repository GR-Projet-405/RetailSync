import { useState } from 'react';
import { Filter } from 'lucide-react';
import SearchInput from '../../../components/SearchInput';
import { cn } from '../../../utils/cn';

export const CustomerSearchBar = ({ value, onChange, statusFilter, onStatusFilterChange, onAddCustomer }) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <SearchInput value={value} onChange={onChange} placeholder="Search customers by name, phone, email..." />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Filter size={16} />
            Filter
          </button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white shadow-lg z-10">
              <button
                type="button"
                onClick={() => { onStatusFilterChange('All'); setShowFilterMenu(false); }}
                className={cn('w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition', statusFilter === 'All' && 'bg-slate-100')}
              >
                All Customers
              </button>
              <button
                type="button"
                onClick={() => { onStatusFilterChange('Active'); setShowFilterMenu(false); }}
                className={cn('w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition', statusFilter === 'Active' && 'bg-slate-100')}
              >
                Active Customers
              </button>
              <button
                type="button"
                onClick={() => { onStatusFilterChange('Inactive'); setShowFilterMenu(false); }}
                className={cn('w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition', statusFilter === 'Inactive' && 'bg-slate-100')}
              >
                Inactive Customers
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onAddCustomer}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <span className="text-base">+</span>
          Add Customer
        </button>
      </div>
    </div>
  );
};

export default CustomerSearchBar;
