import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { EventPagination } from '../types';

interface PaginationProps {
  pagination: EventPagination;
  onPageChange: (page: number) => void;
}

function getVisiblePages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current]);

  if (current > 2) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, from, to, total } = pagination;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
      <p className="text-sm text-slate-500">
        Showing {from}-{to} of {total.toLocaleString()} entries
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {visiblePages.map((pageNumber, index) => {
          const previous = visiblePages[index - 1];
          const showEllipsis = previous !== undefined && pageNumber - previous > 1;

          return (
            <span key={pageNumber} className="flex items-center">
              {showEllipsis && <span className="px-2 text-slate-400">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  'min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors',
                  pageNumber === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
