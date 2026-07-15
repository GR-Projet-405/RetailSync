import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  getWarehouseLocations
} from '../services/warehouseService';

export const WAREHOUSE_QUERY_KEYS = {
  all: ['warehouses'],
  list: (filters) => ['warehouses', 'list', filters],
  detail: (id) => ['warehouses', 'detail', id],
  locations: (id) => ['warehouses', 'locations', id],
};

export const useWarehouses = (filters = {}) => {
  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.list(filters),
    queryFn: () => getWarehouses(filters),
    staleTime: 30_000,
  });
};

export const useWarehouse = (id) => {
  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.detail(id),
    queryFn: () => getWarehouseById(id),
    enabled: !!id,
  });
};

export const useWarehouseLocations = (id) => {
  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.locations(id),
    queryFn: () => getWarehouseLocations(id),
    enabled: !!id,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.all });
    },
  });
};
