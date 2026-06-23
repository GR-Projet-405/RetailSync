// ─── Role Constants ───────────────────────────────────────
// These are the 7 canonical roles for RetailSync
export const ROLES = {
  SUPER_ADMIN:       'SUPER_ADMIN',
  ADMIN:             'ADMIN',
  BRANCH_MANAGER:    'BRANCH_MANAGER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  CASHIER:           'CASHIER',
  EMPLOYEE:          'EMPLOYEE',
  AUDITOR:           'AUDITOR',
};

// ─── Display Labels ───────────────────────────────────────
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]:       'Super Admin',
  [ROLES.ADMIN]:             'Admin',
  [ROLES.BRANCH_MANAGER]:    'Branch Manager',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.CASHIER]:           'Cashier',
  [ROLES.EMPLOYEE]:          'Employee',
  [ROLES.AUDITOR]:           'Auditor',
};

// ─── Badge Color Variants ─────────────────────────────────
export const ROLE_COLORS = {
  SUPER_ADMIN:       'danger',
  ADMIN:             'primary',
  BRANCH_MANAGER:    'secondary',
  INVENTORY_MANAGER: 'warning',
  CASHIER:           'success',
  EMPLOYEE:          'neutral',
  AUDITOR:           'info',
};

// ─── Lucide Icon Names ────────────────────────────────────
export const ROLE_ICONS = {
  SUPER_ADMIN:       'ShieldCheck',
  ADMIN:             'Shield',
  BRANCH_MANAGER:    'Building2',
  INVENTORY_MANAGER: 'PackageSearch',
  CASHIER:           'Receipt',
  EMPLOYEE:          'User',
  AUDITOR:           'ClipboardList',
};

// ─── Helpers ──────────────────────────────────────────────
export const ALL_ROLES = Object.keys(ROLES);

/**
 * Role hierarchy levels for permission comparison.
 * Higher number = more permissions.
 */
export const ROLE_LEVELS = {
  SUPER_ADMIN:       7,
  ADMIN:             6,
  BRANCH_MANAGER:    5,
  INVENTORY_MANAGER: 4,
  CASHIER:           3,
  EMPLOYEE:          2,
  AUDITOR:           1,
};
