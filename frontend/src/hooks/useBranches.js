import { useQuery } from '@tanstack/react-query';
import branchService from '../services/branchService';

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchService.getAll();
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes — branch list rarely changes
  });
};