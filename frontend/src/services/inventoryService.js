import api from './api';

const BASE = '/inventory-management';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const INVENTORY_KEYS = {
  dashboardKPIs:      (ids) => ['inventory', 'dashboard', 'kpis', ids],
  categoryBreakdown:  ()    => ['inventory', 'dashboard', 'category-breakdown'],
  dashboardMovements: (n)   => ['inventory', 'dashboard', 'recent-movements', n],

  stockLevels:   (f) => ['inventory', 'stock-levels', 'list', f],
  stockLevelById:(id)=> ['inventory', 'stock-levels', 'detail', id],

  movementKPIs:  (ids)=> ['inventory', 'stock-movements', 'kpis', ids],
  movements:     (f)  => ['inventory', 'stock-movements', 'list', f],

  adjustments:   (f)  => ['inventory', 'stock-adjustments', 'list', f],

  lowStockStats: ()   => ['inventory', 'low-stock-alerts', 'stats'],
  lowStockAlerts:(f)  => ['inventory', 'low-stock-alerts', 'list', f],
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fmtDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toISOString().split('T')[0];
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { date, time };
};

// ─── Normalisers — shape API docs into the flat shape the UI components expect ─

const normaliseStockLevel = (item) => ({
  _id:          item._id,
  id:           item._id,
  sku:          item.product?.sku          ?? 'N/A',
  product:      item.product?.name         ?? 'Unknown Product',
  category:     item.category?.name        ?? 'Uncategorised',
  warehouse:    item.warehouse?.name       ?? 'Unknown',
  currentStock: item.currentStock          ?? 0,
  reservedStock:item.reservedStock         ?? 0,
  reorderLevel: item.reorderLevel          ?? 0,
  supplier:     item.supplier?.name        ?? 'N/A',
  lastPurchase: fmtDate(item.lastMovementAt),
  image:        item.product?.image        ?? null,
  unit:         item.product?.unit         ?? 'pcs',
  costPrice:    item.product?.costPrice    ?? 0,
  sellingPrice: item.product?.sellingPrice ?? 0,
});

const SUB_MOVEMENT_TYPES = new Set(['SALE', 'TRANSFER_OUT', 'ADJUSTMENT_REMOVE', 'RETURN_OUT', 'DAMAGE_WRITE_OFF']);

const normaliseMovement = (m) => {
  const { date, time } = fmtDateTime(m.performedAt);
  // UI-compatible type labels that match TYPE_CFG in StockMovements.jsx
  const UI_TYPE = {
    SALE:               'Sale',
    PURCHASE:           'Received',
    TRANSFER_IN:        'Transfer In',
    TRANSFER_OUT:       'Transfer Out',
    ADJUSTMENT_ADD:     'Adjustment',
    ADJUSTMENT_REMOVE:  'Adjustment',
    RETURN_IN:          'Return',
    RETURN_OUT:         'Return',
    DAMAGE_WRITE_OFF:   'Adjustment',
  };
  const staffName = m.performedBy
    ? `${m.performedBy.firstName} ${m.performedBy.lastName}`
    : 'System';
  const signedQty = SUB_MOVEMENT_TYPES.has(m.type) ? -m.quantity : m.quantity;
  return {
    _id:         m._id,
    id:          m.movementId,
    referenceId: m.referenceId ?? m.movementId,
    type:        UI_TYPE[m.type] ?? m.type,
    rawType:     m.type,
    product:     m.productId?.name     ?? 'Unknown',
    sku:         m.productId?.sku      ?? 'N/A',
    category:    'N/A',
    source:      m.warehouseId?.name   ?? 'Unknown',
    destination: m.toWarehouseId?.name ?? m.warehouseId?.name ?? 'Unknown',
    warehouse:   m.warehouseId?.name   ?? 'Unknown',
    toWarehouse: m.toWarehouseId?.name ?? null,
    staff:       staffName,
    performedBy: staffName,
    qty:         signedQty,
    date,
    time,
    ref:         m.referenceId ?? '—',
    transferId:  null,
    status:      'Completed',
    reason:      m.notes ?? null,
  };
};

const ADJ_TYPE_MAP = {
  DAMAGED:            'Damaged',
  EXPIRED:            'Expired',
  THEFT_LOSS:         'Theft',
  RETURN_TO_SUPPLIER: 'Return to Supplier',
  FOUND_SURPLUS:      'Add Stock',
  SYSTEM_CORRECTION:  'Cycle Count',
  SUPPLIER_DELIVERY:  'Add Stock',
  OTHER:              null,
};

const normaliseAdjustment = (a) => {
  const staffName = a.requestedBy
    ? `${a.requestedBy.firstName} ${a.requestedBy.lastName}`
    : 'N/A';
  const warehouseName = a.warehouseId?.name ?? 'Unknown';
  const signedQty = a.type === 'REMOVE' ? -a.quantity : a.quantity;
  const adjType = ADJ_TYPE_MAP[a.reason] ?? (a.type === 'ADD' ? 'Add Stock' : 'Damaged');
  const dt = a.createdAt ? fmtDateTime(a.createdAt) : { date: '', time: '' };
  return {
    _id:             a._id,
    id:              a.adjustmentId,
    product:         a.productId?.name    ?? 'Unknown',
    sku:             a.productId?.sku     ?? 'N/A',
    category:        'N/A',
    type:            a.type === 'ADD' ? 'Stock Add' : 'Stock Remove',
    rawType:         a.type,
    adjType,
    qty:             signedQty,
    reason:          a.reason?.replace(/_/g, ' ') ?? '—',
    date:            dt.date,
    time:            dt.time,
    warehouse:       warehouseName,
    branch:          warehouseName,
    adjustedBy:      staffName,
    requestedBy:     staffName,
    status:          a.status,
    notes:           a.notes   ?? null,
    evidence:        a.evidenceUrl ?? null,
    rejectionReason: a.rejectionReason ?? null,
  };
};

const normaliseAlert = (item) => ({
  _id:           item._id,
  id:            `LSA-${item._id?.toString().slice(-4).toUpperCase()}`,
  product:       item.product?.name    ?? 'Unknown',
  sku:           item.product?.sku     ?? 'N/A',
  category:      item.category?.name  ?? 'Uncategorised',
  warehouse:     item.warehouse?.name  ?? 'Unknown',
  currentStock:  item.currentStock     ?? 0,
  reservedStock: item.reservedStock    ?? 0,
  reorderLevel:  item.reorderLevel     ?? 0,
  daysRemaining: null,
  severity:      item.severity === 'CRITICAL' ? 'Critical' : 'Low',
  alertSince:    item.lastMovementAt ? item.lastMovementAt.split('T')[0] : '',
  supplier:      item.supplier?.name   ?? 'N/A',
  acknowledged:  false,
  image:         null,
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardKPIs = async (warehouseIds = []) => {
  const params = warehouseIds.length ? { warehouseIds: warehouseIds.join(',') } : {};
  const { data } = await api.get(`${BASE}/dashboard/kpis`, { params });
  const d = data.data;
  return [
    { label: 'Total Inventory Value', value: `LKR ${Number(d.totalInventoryValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: 0, up: true,  badWhenUp: false },
    { label: 'Total SKUs',            value: Number(d.totalSKUs ?? 0).toLocaleString(),          trend: 0, up: true,  badWhenUp: false },
    { label: 'Low Stock Items',       value: String(d.lowStockItems   ?? 0),                     trend: 0, up: true,  badWhenUp: true  },
    { label: 'Out of Stock Items',    value: String(d.outOfStockItems ?? 0),                     trend: 0, up: true,  badWhenUp: true  },
    { label: 'Stock Turnover',        value: String(d.weekSaleMovements ?? 0),                   trend: 0, up: true,  badWhenUp: false },
  ];
};

export const getStockCategoryBreakdown = async () => {
  const { data } = await api.get(`${BASE}/dashboard/category-breakdown`);
  return data.data;
};

export const getDashboardRecentMovements = async (limit = 5) => {
  const { data } = await api.get(`${BASE}/dashboard/recent-movements`, { params: { limit } });
  return data.data.map(normaliseMovement);
};

// ─── Stock Levels ─────────────────────────────────────────────────────────────

export const getStockLevels = async (params = {}) => {
  const { data } = await api.get(`${BASE}/stock-levels`, { params });
  return {
    items:      (data.data.items ?? []).map(normaliseStockLevel),
    pagination: data.data.pagination,
  };
};

export const getStockLevelById = async (id) => {
  const { data } = await api.get(`${BASE}/stock-levels/${id}`);
  return normaliseStockLevel(data.data);
};

export const updateReorderLevel = async (id, reorderLevel) => {
  const { data } = await api.patch(`${BASE}/stock-levels/${id}/reorder-level`, { reorderLevel });
  return data;
};

// ─── Stock Movements ──────────────────────────────────────────────────────────

export const getMovementKPIs = async (warehouseIds = []) => {
  const params = warehouseIds.length ? { warehouseIds: warehouseIds.join(',') } : {};
  const { data } = await api.get(`${BASE}/stock-movements/kpis`, { params });
  return data.data;
};

export const getMovements = async (params = {}) => {
  const { data } = await api.get(`${BASE}/stock-movements`, { params });
  return {
    movements:  (data.data.movements ?? []).map(normaliseMovement),
    pagination: data.data.pagination,
  };
};

export const recordMovement = async (payload) => {
  const { data } = await api.post(`${BASE}/stock-movements`, payload);
  return data;
};

// ─── Stock Adjustments ────────────────────────────────────────────────────────

export const getAdjustments = async (params = {}) => {
  const { data } = await api.get(`${BASE}/stock-adjustments`, { params });
  return {
    adjustments: (data.data.adjustments ?? []).map(normaliseAdjustment),
    pagination:  data.data.pagination,
  };
};

export const createAdjustment = async (payload) => {
  const { data } = await api.post(`${BASE}/stock-adjustments`, payload);
  return data;
};

export const approveAdjustment = async (id) => {
  const { data } = await api.patch(`${BASE}/stock-adjustments/${id}/approve`);
  return data;
};

export const rejectAdjustment = async (id, rejectionReason) => {
  const { data } = await api.patch(`${BASE}/stock-adjustments/${id}/reject`, { rejectionReason });
  return data;
};

// ─── Low Stock Alerts ─────────────────────────────────────────────────────────

export const getLowStockStats = async () => {
  const { data } = await api.get(`${BASE}/low-stock-alerts/stats`);
  return data.data;
};

export const getLowStockAlerts = async (params = {}) => {
  const { data } = await api.get(`${BASE}/low-stock-alerts`, { params });
  return {
    alerts:     (data.data.alerts ?? []).map(normaliseAlert),
    pagination: data.data.pagination,
  };
};
