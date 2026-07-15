import { useQuery } from '@tanstack/react-query';
import categoryService from '../services/categoryService';

export const useCategories = () =>
  useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryService.listAll(),
    staleTime: 5 * 60 * 1000, // categories rarely change; cache for 5 min
  });
