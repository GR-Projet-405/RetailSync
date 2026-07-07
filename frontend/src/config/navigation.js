import { ROLES } from './roles';

export const NAVIGATION_GROUPS = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        allowedRoles: Object.values(ROLES)
      },
      {
        id: 'notifications',
        name: 'Notifications & Activity',
        path: '/notifications',
        icon: 'BellRing',
        allowedRoles: Object.values(ROLES)
      },
      {
        id: 'audit-logs',
        name: 'Audit Logs',
        path: '/audit-logs',
        icon: 'FileCode2',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AUDITOR]
      },
      {
        id: 'help-support',
        name: 'Help & Support',
        icon: 'HelpCircle',
        allowedRoles: Object.values(ROLES),
        children: [
          {
            id: 'knowledge-base',
            name: 'Knowledge Base',
            path: '/knowledge-base',
            icon: 'BookOpen',
            allowedRoles: Object.values(ROLES)
          },
          {
            id: 'support-ticket-system',
            name: 'Support Ticket System',
            path: '/help-support',
            icon: 'LifeBuoy',
            allowedRoles: Object.values(ROLES)
          }
        ]
      }
    ]
  },
  {
    title: 'Identity & Access',
    items: [
      {
        id: 'authentication',
        name: 'Authentication Info',
        path: '/auth-info',
        icon: 'KeyRound',
        allowedRoles: Object.values(ROLES)
      },
      {
        id: 'user-role-management',
        name: 'User & Role Management',
        path: '/users-roles',
        icon: 'UserCog',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        id: 'employee-management',
        name: 'Employee Management',
        path: '/employees',
        icon: 'Contact',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      },
      {
        id: 'profile-settings',
        name: 'Profile & Settings',
        path: '/profile-settings',
        icon: 'Settings',
        allowedRoles: Object.values(ROLES)
      }
    ]
  },
  {
    title: 'Organization',
    items: [
      {
        id: 'branch-management',
        name: 'Branch Management',
        path: '/branches',
        icon: 'GitFork',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        id: 'warehouse-management',
        name: 'Warehouse Management',
        path: '/warehouses',
        icon: 'Home',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      }
    ]
  },
  {
    title: 'Inventory Management',
    items: [
      {
        id: 'inventory-dashboard',
        name: 'Inventory Dashboard',
        path: '/inventory',
        icon: 'LayoutDashboard',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'stock-levels',
        name: 'Stock Levels',
        path: '/stock-levels',
        icon: 'Boxes',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'stock-movements',
        name: 'Stock Movements',
        path: '/stock-movements',
        icon: 'ArrowLeftRight',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'stock-adjustments',
        name: 'Stock Adjustments',
        path: '/stock-adjustments',
        icon: 'SlidersHorizontal',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'low-stock-alerts',
        name: 'Low Stock Alerts',
        path: '/low-stock-alerts',
        icon: 'BellRing',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
    ]
  },
  {
    title: 'Inventory & Supply',
    items: [
      {
        id: 'product-management',
        name: 'Product Management',
        path: '/products',
        icon: 'ShoppingBag',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'category-management',
        name: 'Category Management',
        path: '/categories',
        icon: 'Layers',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'supplier-management',
        name: 'Supplier Management',
        path: '/suppliers',
        icon: 'Truck',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'purchase-orders',
        name: 'Purchase Orders',
        path: '/purchase-orders',
        icon: 'FileText',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'goods-receiving',
        name: 'Goods Receiving',
        path: '/goods-receiving',
        icon: 'PackageCheck',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      },
      {
        id: 'stock-transfers',
        name: 'Stock Transfers',
        path: '/stock-transfers',
        icon: 'MoveHorizontal',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.INVENTORY_MANAGER]
      }
    ]
  },
  {
    title: 'Sales & POS',
    items: [
      {
        id: 'pos-billing',
        name: 'POS Billing',
        path: '/pos-billing',
        icon: 'Calculator',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER]
      },
      {
        id: 'payment-processing',
        name: 'Payment Processing',
        path: '/payment-processing',
        icon: 'CreditCard',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER]
      },
      {
        id: 'sales-history',
        name: 'Sales History',
        path: '/sales-history',
        icon: 'History',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER]
      },
      {
        id: 'filters-search',
        name: 'Filters & Search',
        path: '/sales-history/filters',
        icon: 'Filter',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER]
      },
      {
        id: 'returns-refunds',
        name: 'Returns & Refunds',
        path: '/returns-refunds',
        icon: 'RotateCcw',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER]
      },
      {
        id: 'customer-management',
        name: 'Customer Management',
        path: '/customers',
        icon: 'Users',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER]
      }
    ]
  },
  {
    title: 'Promotions',
    items: [
      {
        id: 'promotions-dashboard',
        name: 'Promotion Dashboard',
        path: '/promotions-discounts',
        icon: 'Percent',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      },
      {
        id: 'discount-rules',
        name: 'Discount Rules',
        path: '/discount-rules',
        icon: 'Tag',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      },
      {
        id: 'coupon-management',
        name: 'Coupon Management',
        path: '/coupon-management',
        icon: 'Ticket',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      },
      {
        id: 'promotion-analytics',
        name: 'Promotion Analytics',
        path: '/promotion-analytics',
        icon: 'BarChart3',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      }
    ]
  },
  {
    title: 'Analytics & AI',
    items: [
      {
        id: 'reports',
        name: 'Reports',
        path: '/reports',
        icon: 'FileBarChart2',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.AUDITOR]
      },
      {
        id: 'business-analytics',
        name: 'Business Analytics',
        path: '/business-analytics',
        icon: 'TrendingUp',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        id: 'ai-forecasting',
        name: 'AI Forecasting',
        path: '/ai-forecasting',
        icon: 'LineChart',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      },
      {
        id: 'ai-reordering',
        name: 'AI Reordering',
        path: '/ai-reordering',
        icon: 'Brain',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      },
      {
        id: 'ai-assistant',
        name: 'AI Assistant',
        path: '/ai-assistant',
        icon: 'MessageSquareCode',
        allowedRoles: Object.values(ROLES)
      },
      {
        id: 'ai-alerts',
        name: 'AI Anomalies & Alerts',
        path: '/ai-alerts',
        icon: 'BellRing',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]
      }
    ]
  }
];

export const ALL_NAVIGATION_ITEMS = NAVIGATION_GROUPS.reduce((acc, group) => {
  const items = group.items.flatMap((item) => {
    if (item.children?.length) {
      return [item, ...item.children];
    }
    return [item];
  });
  return [...acc, ...items];
}, []);
