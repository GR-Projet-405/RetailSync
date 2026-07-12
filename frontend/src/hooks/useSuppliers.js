// import { useQuery } from '@tanstack/react-query';
// import { getSuppliers } from '../services/supplierServices';

// export const useSuppliers = (params = {}) => {
//   return useQuery({
//     queryKey: ['suppliers', params],
//     queryFn: () => getSuppliers({ status: 'ACTIVE', ...params }),
//     staleTime: 60_000,
//   });
// };
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  // deactivateSupplier,
  SUPPLIER_QUERY_KEYS,
} from '../services/supplierServices';
// 🔔 Adjust this import if your toast utility's API differs (see useGoodsReceiving.js for the same note).
import { toast } from '../utils/toast';

// ─── Queries ──────────────────────────────────────────────

export const useSuppliers = (params = {}) => {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.list(params),
    queryFn: () => getSuppliers(params),
    staleTime: 60_000,
  });
};

export const useSupplier = (id) => {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.detail(id),
    queryFn: () => getSupplierById(id),
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_QUERY_KEYS.all });
      toast.success('Supplier added 🎉');
    },
    onError: (err) => toast.error(err.message || 'Could not add this supplier 😕'),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_QUERY_KEYS.all });
      toast.success('Supplier updated ✅');
    },
    onError: (err) => toast.error(err.message || 'Could not update this supplier 😕'),
  });
};

export const useDeactivateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_QUERY_KEYS.all });
      toast.success('Supplier deactivated');
    },
    onError: (err) => toast.error(err.message || 'Could not deactivate this supplier 😕'),
  });
};
