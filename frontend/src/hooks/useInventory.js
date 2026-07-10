import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as svc from '../services/inventoryService';
import { INVENTORY_KEYS } from '../services/inventoryService';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardKPIs(warehouseIds = []) {
  return useQuery({
    queryKey: INVENTORY_KEYS.dashboardKPIs(warehouseIds),
    queryFn:  () => svc.getDashboardKPIs(warehouseIds),
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: INVENTORY_KEYS.categoryBreakdown(),
    queryFn:  svc.getStockCategoryBreakdown,
  });
}

export function useDashboardRecentMovements(limit = 5) {
  return useQuery({
    queryKey: INVENTORY_KEYS.dashboardMovements(limit),
    queryFn:  () => svc.getDashboardRecentMovements(limit),
  });
}

// ─── Stock Levels ─────────────────────────────────────────────────────────────

export function useStockLevels(filters = {}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.stockLevels(filters),
    queryFn:  () => svc.getStockLevels(filters),
    placeholderData: { items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  });
}

export function useUpdateReorderLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reorderLevel }) => svc.updateReorderLevel(id, reorderLevel),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', 'stock-levels'] }),
  });
}

// ─── Stock Movements ──────────────────────────────────────────────────────────

export function useMovementKPIs(warehouseIds = []) {
  return useQuery({
    queryKey: INVENTORY_KEYS.movementKPIs(warehouseIds),
    queryFn:  () => svc.getMovementKPIs(warehouseIds),
  });
}

export function useMovements(filters = {}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.movements(filters),
    queryFn:  () => svc.getMovements(filters),
    placeholderData: { movements: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  });
}

export function useRecordMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.recordMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
      qc.invalidateQueries({ queryKey: ['inventory', 'stock-levels'] });
    },
  });
}

// ─── Stock Adjustments ────────────────────────────────────────────────────────

export function useAdjustments(filters = {}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.adjustments(filters),
    queryFn:  () => svc.getAdjustments(filters),
    placeholderData: { adjustments: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createAdjustment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', 'stock-adjustments'] }),
  });
}

export function useApproveAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => svc.approveAdjustment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', 'stock-adjustments'] });
      qc.invalidateQueries({ queryKey: ['inventory', 'stock-levels'] });
    },
  });
}

export function useRejectAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }) => svc.rejectAdjustment(id, rejectionReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', 'stock-adjustments'] }),
  });
}

// ─── Low Stock Alerts ─────────────────────────────────────────────────────────

export function useLowStockStats() {
  return useQuery({
    queryKey: INVENTORY_KEYS.lowStockStats(),
    queryFn:  svc.getLowStockStats,
  });
}

export function useLowStockAlerts(filters = {}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.lowStockAlerts(filters),
    queryFn:  () => svc.getLowStockAlerts(filters),
    placeholderData: { alerts: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
  });
}
