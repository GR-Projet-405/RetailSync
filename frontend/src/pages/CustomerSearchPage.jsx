import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CustomerFilterForm from '../features/customer-management/components/CustomerFilterForm';
import CustomerSearchResultsTable from '../features/customer-management/components/CustomerSearchResultsTable';
import { mockCustomers } from '../features/customer-management/data/mockCustomers';
import Pagination from '../components/Pagination';

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

  const filteredCustomers = useMemo(() => {
    return mockCustomers
      .filter((customer) => {
        const nameMatch = customer.name.toLowerCase().includes(appliedFilters.customerName.trim().toLowerCase());
        const phoneMatch = customer.phone.toLowerCase().includes(appliedFilters.phoneNumber.trim().toLowerCase());
        const typeMatch = appliedFilters.customerType ? customer.customerType === appliedFilters.customerType : true;
        const statusMatch = appliedFilters.customerStatus ? customer.status === appliedFilters.customerStatus : true;
        const spendingMatch = appliedFilters.minAmount ? customer.totalSpending >= Number(appliedFilters.minAmount) : true;
        const maxSpendingMatch = appliedFilters.maxAmount ? customer.totalSpending <= Number(appliedFilters.maxAmount) : true;
        const startDateMatch = appliedFilters.startDate ? new Date(customer.lastPurchaseDate) >= new Date(appliedFilters.startDate) : true;
        const endDateMatch = appliedFilters.endDate ? new Date(customer.lastPurchaseDate) <= new Date(appliedFilters.endDate) : true;
        return nameMatch && phoneMatch && typeMatch && statusMatch && spendingMatch && maxSpendingMatch && startDateMatch && endDateMatch;
      })
      .sort((a, b) => {
        switch (appliedFilters.sortBy) {
          case 'name-asc': return a.name.localeCompare(b.name);
          case 'name-desc': return b.name.localeCompare(a.name);
          case 'spending-desc': return b.totalSpending - a.totalSpending;
          case 'spending-asc': return a.totalSpending - b.totalSpending;
          case 'orders-desc': return b.totalOrders - a.totalOrders;
          case 'recent': return new Date(b.lastPurchaseDate) - new Date(a.lastPurchaseDate);
          default: return 0;
        }
      });
  }, [appliedFilters]);

  const totalResults = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const pagedCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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
        <CustomerSearchResultsTable customers={pagedCustomers} />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Showing {startEntry} to {endEntry} of {totalResults} results</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
