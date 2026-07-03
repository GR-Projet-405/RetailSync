import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CustomerFilterForm from '../features/customer-management/components/CustomerFilterForm';
import CustomerSearchResultsTable from '../features/customer-management/components/CustomerSearchResultsTable';
import { useCustomers } from '../features/customer-management/hooks/useCustomers';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

const PAGE_SIZE = 5;

export default function CustomerSearchPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    customerName: '',
    phoneNumber: '',
    customerType: '',
    customerStatus: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: '',
  });
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      customerName: '',
      phoneNumber: '',
      customerType: '',
      customerStatus: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: '',
    });
    setAppliedFilters({
      customerName: '',
      phoneNumber: '',
      customerType: '',
      customerStatus: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: '',
    });
    setPage(1);
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const { customers, loading, totalCount } = useCustomers({
    search: [appliedFilters.customerName, appliedFilters.phoneNumber]
      .filter(Boolean)
      .join(' ')
      .trim(),
    status: appliedFilters.customerStatus || 'All',
    customerType: appliedFilters.customerType,
    sortBy: appliedFilters.sortBy,
    page,
    limit: PAGE_SIZE,
  });

  const totalResults = totalCount;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const pagedCustomers = customers;
  const startEntry = totalResults === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(totalResults, page * PAGE_SIZE);

  return (
    <div className="space-y-8 fade-up">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Home / Customers / <span className="font-semibold text-slate-900">Search</span></p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Search & Filters</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleReset}>Reset Filters</Button>
          <Button variant="primary" onClick={handleSearch}>Search</Button>
        </div>
      </div>

      <CustomerFilterForm filters={filters} onChange={handleChange} />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <CustomerSearchResultsTable customers={pagedCustomers} />
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Showing {startEntry} to {endEntry} of {totalResults} results</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
