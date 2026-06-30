import { useMemo, useState, useEffect } from 'react';
import { mockCustomers } from '../data/mockCustomers';

export function useCustomers({ search = '', status = 'All', page = 1, limit = 6 } = {}) {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const normalizedSearch = search.trim().toLowerCase();

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      const filtered = mockCustomers.filter((item) => {
        const matchesSearch = normalizedSearch
          ? [item.name, item.phone, item.email].some((value) => value.toLowerCase().includes(normalizedSearch))
          : true;
        const matchesStatus = status === 'All' || status === '' ? true : item.status === status;
        return matchesSearch && matchesStatus;
      });

      setTotalCount(filtered.length);
      const startIndex = (page - 1) * limit;
      const paged = filtered.slice(startIndex, startIndex + limit);
      setCustomers(paged);
      setLoading(false);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [normalizedSearch, status, page, limit]);

  return useMemo(() => ({ customers, loading, totalCount }), [customers, loading, totalCount]);
}
