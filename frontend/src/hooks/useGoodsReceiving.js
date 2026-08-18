import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDashboardStats,
  getReceivedItemsHistory,
  getReceivingReports,
  getReceiptById,
  getReceiptForVerification,
  createReceipt,
  verifyItem,
  approveAllItems,
  partialApproveItems,
  rejectReceipt,
  flagReceiptForManager,
  GR_QUERY_KEYS,
} from '../services/goodsReceivingService';
// 🔔 Adjust this import if your toast utility exports something different
// (e.g. `import toast from '../utils/toast'` for a default export).
import { toast } from '../utils/toast';

// ─── Queries ──────────────────────────────────────────────

export const useDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: GR_QUERY_KEYS.dashboard,
    queryFn: () => getDashboardStats(params),
    staleTime: 30_000,
  });
};

export const useReceivedItemsHistory = (filters = {}) => {
  return useQuery({
    queryKey: GR_QUERY_KEYS.history(filters),
    queryFn: () => getReceivedItemsHistory(filters),
    placeholderData: (prev) => prev,
  });
};

export const useReceivingReports = (filters = {}) => {
  return useQuery({
    queryKey: GR_QUERY_KEYS.reports(filters),
    queryFn: () => getReceivingReports(filters),
  });
};

export const useReceipt = (id, options = {}) => {
  return useQuery({
    queryKey: GR_QUERY_KEYS.detail(id),
    queryFn: () => getReceiptById(id),
    enabled: !!id,
    ...options,
  });
};

export const useReceiptForVerification = (id) => {
  return useQuery({
    queryKey: GR_QUERY_KEYS.verification(id),
    queryFn: () => getReceiptForVerification(id),
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────

export const useCreateReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.all });
      toast.success('Goods receipt saved 🎉');
    },
    onError: (err) => toast.error(err.message || 'Could not save this receipt 😕'),
  });
};

export const useVerifyItem = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, action, note }) => verifyItem(id, itemId, { action, note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.verification(id) }),
    onError: (err) => toast.error(err.message || 'Could not update that item 😕'),
  });
};

export const useApproveAllItems = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes) => approveAllItems(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.verification(id) });
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.all });
      toast.success('Receipt fully approved ✅');
    },
    onError: (err) => toast.error(err.message || 'Could not approve this receipt 😕'),
  });
};

export const usePartialApproveItems = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ approvedItemIds, notes }) => partialApproveItems(id, { approvedItemIds, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.verification(id) });
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.all });
      toast.success('Receipt partially approved 👍');
    },
    onError: (err) => toast.error(err.message || 'Could not partially approve this receipt 😕'),
  });
};

export const useRejectReceipt = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason) => rejectReceipt(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.verification(id) });
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.all });
      toast.success('Receipt rejected');
    },
    onError: (err) => toast.error(err.message || 'Could not reject this receipt 😕'),
  });
};

export const useFlagForManager = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes) => flagReceiptForManager(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GR_QUERY_KEYS.verification(id) });
      toast.success('Flagged for manager review 🚩');
    },
    onError: (err) => toast.error(err.message || 'Could not flag this receipt 😕'),
  });
};
