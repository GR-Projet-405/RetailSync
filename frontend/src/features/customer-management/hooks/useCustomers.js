import { useMemo, useState, useEffect } from 'react';
import customerService from '../services/customerService';

export function useCustomers({
  search = '',
  status = 'All',
  customerType = '',
  sortBy = '',
  page = 1,
  limit = 6,
  phoneNumber = '',
} = {}) {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = {
      search: [search, phoneNumber].filter(Boolean).join(' ').trim() || undefined,
      status: status === 'All' ? undefined : status,
      customerType: customerType || undefined,
      sortBy: sortBy || undefined,
      page,
      limit,
    };

    customerService
      .getCustomers(params)
      .then((result) => {
        if (!isMounted) return;
        setCustomers(result.customers || []);
        setTotalCount(result.totalCount || 0);
      })
      .catch((fetchError) => {
        console.error('Error loading customers:', fetchError.message);
        if (!isMounted) return;
        setError(fetchError);
        setCustomers([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, status, customerType, sortBy, page, limit, phoneNumber]);

  return useMemo(
    () => ({ customers, loading, totalCount, error }),
    [customers, loading, totalCount, error]
  );
}
