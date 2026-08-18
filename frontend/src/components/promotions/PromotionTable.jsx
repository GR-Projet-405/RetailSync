import React, { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Search, ChevronLeft, ChevronRight, MoreVertical, X } from 'lucide-react';
import Badge from '../Badge';
import Button from '../Button';

export default function PromotionTable({ 
  promotions = [], 
  onView, 
  onEdit, 
  onDelete,
  onCouponsClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Filter & Search logic
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      const matchesSearch = 
        promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All' || 
        promo.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [promotions, searchTerm, statusFilter]);

  // Pagination logic
  const totalItems = filteredPromotions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  
  // Adjust current page if filters reduce item count below page range
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPromotions = useMemo(() => {
    return filteredPromotions.slice(startIndex, startIndex + pageSize);
  }, [filteredPromotions, startIndex, pageSize]);

  // Format currency
  const formatCurrency = (val) => {
    if (typeof val === 'number') {
      return `Rs. ${val.toLocaleString()}`;
    }
    return val;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Scheduled':
        return 'primary';
      case 'Expired':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col select-none">
      
      {/* Table Filters & Search */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-xl p-1 w-fit">
          {['All', 'Active', 'Scheduled', 'Expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === tab
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.25]" />
          <input
            type="text"
            placeholder="Search by promotion name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-8 py-2 text-xs font-semibold bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 font-extrabold">Promotion</th>
              <th className="px-6 py-4 font-extrabold">Branch</th>
              <th className="px-6 py-4 font-extrabold text-center">Status</th>
              <th className="px-6 py-4 font-extrabold">Duration</th>
              <th className="px-6 py-4 font-extrabold text-center">Coupons</th>
              <th className="px-6 py-4 font-extrabold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promo) => {
                // Inline date formatter for cleaner layout
                const formatDate = (dateStr) => {
                  if (!dateStr) return '—';
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) return dateStr;
                  return date.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                };

                return (
                  <tr
                    key={promo.id}
                    className="hover:bg-blue-50/10 transition-colors duration-150"
                  >
                    {/* Name */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{promo.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5 max-w-[220px] truncate" title={promo.categories && promo.categories.length > 0 ? promo.categories.map(c => typeof c === 'object' ? c.name : c).join(', ') : 'All Categories'}>
                        {promo.categories && promo.categories.length > 0
                          ? promo.categories.map(c => typeof c === 'object' ? c.name || c._id : c).join(', ')
                          : 'All Categories'}
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-slate-600 font-semibold">
                      <span className="bg-slate-100/80 border border-slate-200/55 px-2 py-0.5 rounded-full text-[11px]">
                        {promo.branch || 'All Branches'}
                      </span>
                    </td>
                    


                    {/* Status */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-center">
                      <Badge variant={getStatusVariant(promo.status)}>
                        {promo.status}
                      </Badge>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-slate-500 font-semibold font-mono text-[11px]">
                      {formatDate(promo.startDate)} – {formatDate(promo.endDate)}
                    </td>

                    {/* Coupons Count */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-center font-bold text-slate-800">
                      <button
                        type="button"
                        onClick={() => onCouponsClick && onCouponsClick(promo)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-bold focus:outline-none bg-blue-50/50 hover:bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 transition-colors inline-block"
                      >
                        {promo.couponCount || 0}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-center relative">
                      <div className="flex items-center justify-center gap-3">
                        {/* View Action */}
                        <button
                          onClick={() => onView(promo)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Promotion"
                        >
                          <Eye className="w-4 h-4 stroke-[2.25]" />
                        </button>

                        {/* Edit Action */}
                        <button
                          onClick={() => onEdit(promo)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Promotion"
                        >
                          <Pencil className="w-4 h-4 stroke-[2.25]" />
                        </button>

                        {/* Options/More/Delete Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === promo.id ? null : promo.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === promo.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <div className="absolute right-0 bottom-full mb-1.5 w-28 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden text-xs text-left">
                                <button
                                  onClick={() => {
                                    onDelete(promo.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1.5 font-bold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-14 text-center text-slate-400 select-none font-semibold">
                  No promotions found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Count Label */}
        <span className="text-xs font-semibold text-slate-400">
          Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of {totalItems} campaigns
        </span>

        {/* Page controls */}
        <div className="flex items-center gap-2">
          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg bg-white px-2.5 py-1 text-slate-600 outline-none focus:border-blue-600 cursor-pointer"
            >
              {[5, 10, 20].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Page Numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.25]" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.25]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
