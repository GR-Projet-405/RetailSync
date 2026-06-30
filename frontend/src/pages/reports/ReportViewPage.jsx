import { useState, useMemo } from 'react';
import { generateReportPDF } from '../../utils/reportPdfExport';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  BarChart2, Package, DollarSign, Users, UserCheck,
  ChevronRight, ChevronLeft, RefreshCw, Printer, Download, Calendar,
  MapPin, Search, Filter, ArrowUpRight, ArrowDownRight, Clock, FileText,
  User as UserIcon,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { cn } from '../../utils/cn';

// ─── Meta ──────────────────────────────────────────────────────────────────────
const REPORT_META = {
  sales:     { label: 'Sales Report',     Icon: BarChart2,  iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    accent: '#3B82F6' },
  inventory: { label: 'Inventory Report', Icon: Package,    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', accent: '#10B981' },
  finance:   { label: 'Finance Report',   Icon: DollarSign, iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   accent: '#F59E0B' },
  employee:  { label: 'Employee Report',  Icon: Users,      iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',  accent: '#8B5CF6' },
  customer:  { label: 'Customer Report',  Icon: UserCheck,  iconBg: 'bg-rose-100',    iconColor: 'text-rose-600',    accent: '#F43F5E' },
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const CUSTOMERS = [
  'Michael Chen','Sarah Jenkins','David Miller','Elena Rodriguez','James Wilson',
  'Aisha Patel','Robert Kim','Laura Martinez','Thomas Wright','Nina Shah',
  "Kevin O'Brien",'Priya Gupta','Marcus Johnson','Chloe Anderson','Ethan Brooks',
  'Sofia Torres','Daniel Park','Rachel Green','Tyler Adams','Maria Garcia',
  'Samuel Lee','Jessica Wong','Andrew Nguyen','Olivia Brown','Chris Taylor',
];

const PRODUCTS = [
  { name: 'MacBook Pro 14"',    cat: 'Electronics',   unitPrice: 1999 },
  { name: 'iPhone 15 Pro',      cat: 'Electronics',   unitPrice: 999  },
  { name: 'Samsung TV 55"',     cat: 'Electronics',   unitPrice: 649  },
  { name: 'Coffee Maker Pro',   cat: 'Home & Living', unitPrice: 89   },
  { name: 'Yoga Mat Premium',   cat: 'Sports',        unitPrice: 45   },
  { name: 'Running Shoes X3',   cat: 'Fashion',       unitPrice: 129  },
  { name: 'Organic Coffee 1kg', cat: 'Beverages',     unitPrice: 24   },
  { name: 'Sourdough Bread',    cat: 'Bakery',        unitPrice: 5    },
  { name: 'Whole Milk 2L',      cat: 'Dairy',         unitPrice: 3    },
  { name: 'Wireless Earbuds',   cat: 'Electronics',   unitPrice: 149  },
  { name: 'Smart Watch Pro',    cat: 'Electronics',   unitPrice: 299  },
  { name: 'Leather Wallet',     cat: 'Fashion',       unitPrice: 59   },
];

const INV_ITEMS = [
  { sku:'EL-001', name:'MacBook Pro 14"',      cat:'Electronics',   unitValue:'$1,999', baseQty:42  },
  { sku:'EL-002', name:'iPhone 15 Pro',         cat:'Electronics',   unitValue:'$999',   baseQty:0   },
  { sku:'EL-003', name:'Samsung TV 55"',        cat:'Electronics',   unitValue:'$649',   baseQty:18  },
  { sku:'EL-004', name:'Wireless Earbuds',      cat:'Electronics',   unitValue:'$149',   baseQty:85  },
  { sku:'EL-005', name:'Smart Watch Pro',       cat:'Electronics',   unitValue:'$299',   baseQty:7   },
  { sku:'HO-001', name:'Coffee Maker Pro',      cat:'Home & Living', unitValue:'$89',    baseQty:34  },
  { sku:'HO-002', name:'Stand Mixer 5L',        cat:'Home & Living', unitValue:'$199',   baseQty:12  },
  { sku:'FA-001', name:'Running Shoes X3',      cat:'Fashion',       unitValue:'$129',   baseQty:63  },
  { sku:'FA-002', name:'Leather Wallet',        cat:'Fashion',       unitValue:'$59',    baseQty:0   },
  { sku:'BV-001', name:'Organic Coffee 1kg',    cat:'Beverages',     unitValue:'$24',    baseQty:8   },
  { sku:'BV-002', name:'Green Tea Premium',     cat:'Beverages',     unitValue:'$18',    baseQty:45  },
  { sku:'BK-001', name:'Sourdough Bread',       cat:'Bakery',        unitValue:'$5',     baseQty:15  },
  { sku:'BK-002', name:'Croissant Box 6pcs',    cat:'Bakery',        unitValue:'$12',    baseQty:22  },
  { sku:'DA-001', name:'Organic Whole Milk 2L', cat:'Dairy',         unitValue:'$3',     baseQty:124 },
  { sku:'DA-002', name:'Greek Yogurt 500g',     cat:'Dairy',         unitValue:'$5',     baseQty:3   },
  { sku:'SP-001', name:'Yoga Mat Premium',      cat:'Sports',        unitValue:'$45',    baseQty:29  },
];

const EMP_DATA = [
  { id:'EMP-001', name:'Alex Chen',      role:'Branch Manager',    dept:'Management', baseSales:24200, txns:184, rating:4.9 },
  { id:'EMP-002', name:'Sarah Patel',    role:'Senior Cashier',    dept:'Cashier',    baseSales:19800, txns:162, rating:4.7 },
  { id:'EMP-003', name:'Mark Johnson',   role:'Cashier',           dept:'Cashier',    baseSales:16400, txns:138, rating:4.5 },
  { id:'EMP-004', name:'Emma Davis',     role:'Inventory Manager', dept:'Inventory',  baseSales:14100, txns:96,  rating:4.6 },
  { id:'EMP-005', name:'James Wilson',   role:'Cashier',           dept:'Cashier',    baseSales:11200, txns:104, rating:4.3 },
  { id:'EMP-006', name:'Priya Gupta',    role:'Branch Manager',    dept:'Management', baseSales:22800, txns:176, rating:4.8 },
  { id:'EMP-007', name:'Daniel Park',    role:'Cashier',           dept:'Cashier',    baseSales:9800,  txns:88,  rating:4.2 },
  { id:'EMP-008', name:'Rachel Green',   role:'Support Staff',     dept:'Support',    baseSales:4200,  txns:42,  rating:4.4 },
  { id:'EMP-009', name:"Kevin O'Brien",  role:'Inventory Staff',   dept:'Inventory',  baseSales:3800,  txns:38,  rating:4.1 },
  { id:'EMP-010', name:'Chloe Anderson', role:'Senior Cashier',    dept:'Cashier',    baseSales:17200, txns:148, rating:4.6 },
  { id:'EMP-011', name:'Thomas Wright',  role:'Branch Manager',    dept:'Management', baseSales:21400, txns:168, rating:4.7 },
  { id:'EMP-012', name:'Sofia Torres',   role:'Support Staff',     dept:'Support',    baseSales:3200,  txns:28,  rating:4.3 },
];

const CUST_DATA = [
  { id:'CUS-8821', name:'Michael Chen',    segment:'VIP',     tier:'Platinum', baseSpend:4280, visits:24 },
  { id:'CUS-4412', name:'Sarah Jenkins',   segment:'Regular', tier:'Gold',     baseSpend:3840, visits:18 },
  { id:'CUS-6634', name:'Elena Rodriguez', segment:'Regular', tier:'Silver',   baseSpend:2920, visits:15 },
  { id:'CUS-2201', name:'James Wilson',    segment:'Regular', tier:'Bronze',   baseSpend:2140, visits:12 },
  { id:'CUS-9980', name:'Aisha Patel',     segment:'New',     tier:'Bronze',   baseSpend:320,  visits:2  },
  { id:'CUS-3345', name:'Robert Kim',      segment:'VIP',     tier:'Platinum', baseSpend:5120, visits:31 },
  { id:'CUS-7712', name:'Priya Gupta',     segment:'Regular', tier:'Gold',     baseSpend:3100, visits:16 },
  { id:'CUS-5523', name:'David Miller',    segment:'Regular', tier:'Silver',   baseSpend:1840, visits:10 },
  { id:'CUS-1190', name:'Olivia Brown',    segment:'New',     tier:'Bronze',   baseSpend:180,  visits:1  },
  { id:'CUS-6678', name:'Tyler Adams',     segment:'Regular', tier:'Bronze',   baseSpend:920,  visits:7  },
  { id:'CUS-4490', name:'Nina Shah',       segment:'VIP',     tier:'Gold',     baseSpend:3680, visits:22 },
  { id:'CUS-8834', name:'Marcus Johnson',  segment:'Regular', tier:'Silver',   baseSpend:2200, visits:13 },
  { id:'CUS-2267', name:'Chloe Anderson',  segment:'Regular', tier:'Bronze',   baseSpend:680,  visits:5  },
  { id:'CUS-5501', name:'Ethan Brooks',    segment:'New',     tier:'Bronze',   baseSpend:240,  visits:2  },
  { id:'CUS-7789', name:'Maria Garcia',    segment:'VIP',     tier:'Platinum', baseSpend:4680, visits:28 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rangeDays(from, to) {
  if (!from || !to) return 30;
  return Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000));
}

function fmtMoney(n) {
  const abs  = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtNum(n) { return Number(n).toLocaleString(); }

function pr(seed) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }

function genTrendDates(from, to, count = 6) {
  const f = from ? new Date(from) : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
  const t = to   ? new Date(to)   : new Date();
  const ms = t - f;
  return Array.from({ length: count }, (_, i) =>
    new Date(f.getTime() + ms * i / Math.max(count - 1, 1))
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
}

function genRevDates(from, to, count) {
  const f = from ? new Date(from) : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
  const t = to   ? new Date(to)   : new Date();
  const ms = t - f;
  return Array.from({ length: count }, (_, i) =>
    new Date(t.getTime() - ms * i / Math.max(count - 1, 1))
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
}

// ─── Badges (used inside column render fns in computeViewData) ─────────────────
function TxBadge({ status }) {
  const s = { PAID:'bg-emerald-50 text-emerald-700 border-emerald-200', REFUNDED:'bg-red-50 text-red-700 border-red-200', PENDING:'bg-amber-50 text-amber-700 border-amber-200' };
  return <span className={cn('inline-flex px-2 py-0.5 rounded text-[11px] font-bold border tracking-wide', s[status] || s.PAID)}>{status}</span>;
}

function InvBadge({ status }) {
  const s = { 'IN STOCK':'bg-emerald-50 text-emerald-700 border-emerald-200', 'LOW STOCK':'bg-amber-50 text-amber-700 border-amber-200', 'OUT OF STOCK':'bg-red-50 text-red-700 border-red-200' };
  return <span className={cn('inline-flex px-2 py-0.5 rounded text-[11px] font-bold border tracking-wide', s[status] || '')}>{status}</span>;
}

function TierBadge({ tier }) {
  const s = { Platinum:'bg-violet-50 text-violet-700 border-violet-200', Gold:'bg-yellow-50 text-yellow-700 border-yellow-200', Silver:'bg-slate-100 text-slate-600 border-slate-200', Bronze:'bg-amber-50 text-amber-700 border-amber-200' };
  return <span className={cn('inline-flex px-2 py-0.5 rounded text-[11px] font-bold border', s[tier] || '')}>{tier}</span>;
}

// ─── Core compute function ────────────────────────────────────────────────────
function computeViewData({ reportType, dateFrom, dateTo, displayBranches, stockStatus, financeSubType, roleFilter, customerSegment, loyaltyTier, savedRows }) {
  const days = rangeDays(dateFrom, dateTo);
  const nb   = displayBranches.length || 1;
  const td   = genTrendDates(dateFrom, dateTo, 6);

  // ── SALES ──────────────────────────────────────────────────────────────────
  if (reportType === 'sales') {
    const totalRev    = 4280 * nb * days;
    const totalOrders = Math.round(128 * nb * days / 30);
    const aov         = totalRev / Math.max(totalOrders, 1);
    const topBranch   = displayBranches[0] || 'Main HQ';

    const trend = td.map((date, i) => {
      const p = i / (td.length - 1);
      return { date, revenue: Math.round(totalRev * (p * 0.85 + 0.15)), target: Math.round(totalRev * (p * 0.8 + 0.2)) };
    });

    const catRevs = [totalRev * 0.45, totalRev * 0.27, totalRev * 0.18, totalRev * 0.06];
    const bars = ['Electronics', 'Home & Living', 'Fashion', 'Beverages'].map((name, i) => ({
      name, amount: fmtMoney(catRevs[i]),
      color: ['#3B82F6','#10B981','#F59E0B','#8B5CF6'][i],
      pct: Math.round(catRevs[i] / catRevs[0] * 100),
    }));

    const branchPcts = nb === 1 ? [100] : nb === 2 ? [55, 45] : [45, 35, 20];
    const donut = displayBranches.slice(0, 4).map((name, i) => ({
      name, value: branchPcts[i] ?? Math.round(100 / nb),
      color: ['#3B82F6','#10B981','#F59E0B','#8B5CF6'][i],
    }));

    const numRows = Math.min(Math.max(savedRows || totalOrders, 20), 40);
    const rowDates = genRevDates(dateFrom, dateTo, numRows);
    const statuses = ['PAID','PAID','PAID','PAID','REFUNDED','PAID','PENDING'];
    const tableRows = Array.from({ length: numRows }, (_, i) => {
      const prod = PRODUCTS[i % PRODUCTS.length];
      const qty  = Math.floor(pr(i * 3) * 3) + 1;
      const amt  = prod.unitPrice * qty;
      return {
        id: `#${89234 - i}`,
        date: `${rowDates[i]}, ${10 + (i % 8)}:${String(i % 60).padStart(2, '0')}`,
        customer: CUSTOMERS[i % CUSTOMERS.length],
        branch: displayBranches[i % displayBranches.length],
        category: prod.cat,
        amount: `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: statuses[i % statuses.length],
      };
    });

    return {
      kpis: [
        { label:'Total Revenue',   value:fmtMoney(totalRev),   trend:'+12.5%', up:true  },
        { label:'Avg Order Value', value:`$${aov.toFixed(2)}`, trend:'+5.2%',  up:true  },
        { label:'Total Orders',    value:fmtNum(totalOrders),  trend:'+8.2%',  up:true  },
        { label:'Top Branch',      value:topBranch, sub:fmtMoney(totalRev * 0.42), subClass:'text-blue-600' },
      ],
      trend,
      trendLines: [{ key:'revenue', label:'Revenue', color:'#3B82F6' }, { key:'target', label:'Target', color:'#CBD5E1', dashed:true }],
      trendLabel: `Revenue Trend (${td[0]} – ${td[td.length - 1]})`,
      bars, barsLabel: 'Top Product Categories',
      donut, donutLabel: 'Revenue by Branch', donutCenter: `${fmtMoney(totalRev)}\nTOTAL`,
      tableRows, tableLabel: 'Sales Transactions',
      columns: [
        { key:'id',       header:'Order ID',  render:(r) => <span className="font-semibold text-blue-600">{r.id}</span> },
        { key:'date',     header:'Date',      render:(r) => <span className="text-slate-500 text-xs">{r.date}</span> },
        { key:'customer', header:'Customer',  render:(r) => <span className="font-medium text-slate-800">{r.customer}</span> },
        { key:'branch',   header:'Branch',    render:(r) => <span className="text-slate-500 text-xs">{r.branch}</span> },
        { key:'category', header:'Category',  render:(r) => <span className="text-slate-600 text-xs">{r.category}</span> },
        { key:'amount',   header:'Amount',    render:(r) => <span className="font-bold text-slate-900">{r.amount}</span> },
        { key:'status',   header:'Status',    render:(r) => <TxBadge status={r.status} /> },
      ],
    };
  }

  // ── INVENTORY ──────────────────────────────────────────────────────────────
  if (reportType === 'inventory') {
    const allItems = INV_ITEMS.flatMap((item, ii) =>
      displayBranches.map((branch, bi) => ({
        ...item, branch,
        qty: Math.max(0, item.baseQty + Math.round((pr(ii * 7 + bi) - 0.5) * 20)),
      }))
    );

    const filtered = !stockStatus ? allItems : allItems.filter(it => {
      if (stockStatus === 'In Stock')     return it.qty > 10;
      if (stockStatus === 'Low Stock')    return it.qty > 0 && it.qty <= 10;
      if (stockStatus === 'Out of Stock') return it.qty === 0;
      return true;
    });

    const totalSKUs  = filtered.length;
    const lowStock   = filtered.filter(i => i.qty > 0 && i.qty <= 10).length;
    const outOfStock = filtered.filter(i => i.qty === 0).length;
    const stockValue = filtered.reduce((s, i) => {
      const v = parseFloat(i.unitValue.replace(/[$,]/g, '')) * i.qty;
      return s + (isNaN(v) ? 0 : v);
    }, 0);

    const baseStock = 2847 * nb;
    const trend = td.map((date, i) => ({
      date, stock: Math.round(baseStock * (1 - i * 0.02)), reorder: Math.round(300 * nb),
    }));

    const catQtys = ['Electronics','Beverages','Bakery','Dairy','Fashion','Sports','Home & Living'].map(cat => ({
      cat, qty: filtered.filter(f => f.cat === cat).reduce((s, i) => s + i.qty, 0),
    })).filter(c => c.qty > 0).sort((a, b) => b.qty - a.qty).slice(0, 4);
    const maxQ = catQtys[0]?.qty || 1;
    const bars = catQtys.map((c, i) => ({
      name: c.cat, amount: `${fmtNum(c.qty)} units`,
      color: ['#3B82F6','#10B981','#F59E0B','#8B5CF6'][i],
      pct: Math.round(c.qty / maxQ * 100),
    }));

    const branchPcts = nb === 1 ? [100] : nb === 2 ? [55, 45] : [40, 35, 25];
    const donut = displayBranches.slice(0, 4).map((name, i) => ({
      name, value: branchPcts[i] ?? Math.round(100 / nb),
      color: ['#3B82F6','#10B981','#F59E0B','#8B5CF6'][i],
    }));

    const tableRows = filtered.slice(0, 30).map(it => ({
      sku: it.sku, name: it.name, stock: it.qty, branch: it.branch,
      status: it.qty === 0 ? 'OUT OF STOCK' : it.qty <= 10 ? 'LOW STOCK' : 'IN STOCK',
      value: it.unitValue,
    }));

    return {
      kpis: [
        { label:'Total SKUs',      value:fmtNum(totalSKUs),    trend:'+3.2%',              up:true            },
        { label:'Low Stock Items', value:String(lowStock),      trend:`${lowStock} flagged`, up:false           },
        { label:'Out of Stock',    value:String(outOfStock),    trend:`${outOfStock} items`, up:outOfStock === 0 },
        { label:'Stock Value',     value:fmtMoney(stockValue),  sub:'Total inventory value', subClass:'text-emerald-600' },
      ],
      trend,
      trendLines: [{ key:'stock', label:'Total Stock', color:'#10B981' }, { key:'reorder', label:'Reorder Zone', color:'#F59E0B', dashed:true }],
      trendLabel: `Stock Level Trend (${td[0]} – ${td[td.length - 1]})`,
      bars, barsLabel: 'Stock by Category',
      donut, donutLabel: 'Stock by Branch', donutCenter: `${fmtNum(totalSKUs)}\nSKUs`,
      tableRows, tableLabel: 'Inventory Items',
      columns: [
        { key:'sku',    header:'SKU',        render:(r) => <span className="font-mono text-xs font-semibold text-emerald-700">{r.sku}</span> },
        { key:'name',   header:'Product',    render:(r) => <span className="font-medium text-slate-800">{r.name}</span> },
        { key:'stock',  header:'Qty',        render:(r) => <span className="font-bold text-slate-900">{r.stock}</span> },
        { key:'branch', header:'Branch',     render:(r) => <span className="text-slate-500 text-xs">{r.branch}</span> },
        { key:'status', header:'Status',     render:(r) => <InvBadge status={r.status} /> },
        { key:'value',  header:'Unit Value', render:(r) => <span className="font-semibold text-slate-900">{r.value}</span> },
      ],
    };
  }

  // ── FINANCE ────────────────────────────────────────────────────────────────
  if (reportType === 'finance') {
    const sub      = financeSubType || 'revenue';
    const baseRev  = (days / 30) * 284200 * nb;
    const baseCost = baseRev * 0.76;
    const netP     = baseRev - baseCost;
    const taxAmt   = baseRev * 0.1;
    const margin   = (netP / baseRev * 100).toFixed(1);

    const trend = td.map((date, i) => {
      const p = i / (td.length - 1);
      return { date, revenue: Math.round(baseRev * (p * 0.85 + 0.15)), cost: Math.round(baseCost * (p * 0.85 + 0.15)) };
    });
    const bars = [
      { name:'Product Sales', amount:fmtMoney(baseRev * 0.698), color:'#F59E0B', pct:100 },
      { name:'Service Fees',  amount:fmtMoney(baseRev * 0.190), color:'#10B981', pct:27  },
      { name:'Subscriptions', amount:fmtMoney(baseRev * 0.112), color:'#3B82F6', pct:16  },
    ];
    const donut = [
      { name:'COGS',      value:52, color:'#F59E0B' },
      { name:'Operating', value:28, color:'#EF4444' },
      { name:'Tax',       value:13, color:'#3B82F6' },
      { name:'Other',     value:7,  color:'#CBD5E1' },
    ];

    const refBase = 421 + Math.floor(days * nb);
    const rowDates = genRevDates(dateFrom, dateTo, 25);

    const subLabel = { revenue:'Revenue Report', tax:'Tax Report', pnl:'P&L Report', cashflow:'Cash Flow Report' }[sub] || 'Finance Report';
    let tableRows, columns, kpis;

    if (sub === 'tax') {
      const taxCats = ['Product Sales','Service Fees','Digital Goods','Import Duties','Luxury Tax'];
      tableRows = Array.from({ length: 25 }, (_, i) => {
        const gross = Math.round(baseRev / 25 * (0.5 + pr(i * 3)));
        const rate  = [10, 12, 8, 15, 18][i % 5];
        const tamt  = Math.round(gross * rate / 100);
        return { ref:`TAX-2024-${String(refBase - i).padStart(4,'0')}`, date:rowDates[i], cat:taxCats[i % taxCats.length], grossRev:`$${gross.toLocaleString()}`, taxRate:`${rate}%`, taxAmt:`$${tamt.toLocaleString()}`, netRev:`$${(gross - tamt).toLocaleString()}` };
      });
      columns = [
        { key:'ref',      header:'Reference',     render:(r) => <span className="font-mono text-xs font-semibold text-amber-600">{r.ref}</span> },
        { key:'date',     header:'Date',          render:(r) => <span className="text-slate-500 text-xs">{r.date}</span> },
        { key:'cat',      header:'Category',      render:(r) => <span className="font-medium text-slate-800">{r.cat}</span> },
        { key:'grossRev', header:'Gross Revenue', render:(r) => <span className="font-bold text-slate-900">{r.grossRev}</span> },
        { key:'taxRate',  header:'Tax Rate',      render:(r) => <span className="text-slate-700">{r.taxRate}</span> },
        { key:'taxAmt',   header:'Tax Amount',    render:(r) => <span className="font-bold text-amber-600">{r.taxAmt}</span> },
        { key:'netRev',   header:'Net Revenue',   render:(r) => <span className="font-semibold text-emerald-600">{r.netRev}</span> },
      ];
      kpis = [
        { label:'Tax Collected',  value:fmtMoney(taxAmt),         trend:'+9.4%',    up:true  },
        { label:'Avg Tax Rate',   value:'10.0%',                   trend:'Standard', up:true  },
        { label:'Gross Revenue',  value:fmtMoney(baseRev),         trend:'+9.4%',    up:true  },
        { label:'Net After Tax',  value:fmtMoney(baseRev - taxAmt), sub:'Post-tax',  subClass:'text-amber-600' },
      ];
    } else if (sub === 'pnl') {
      const pnlCats = ['Electronics','Home & Living','Fashion','Beverages','Bakery'];
      tableRows = Array.from({ length: 25 }, (_, i) => {
        const income   = Math.round(baseRev / 25 * (0.5 + pr(i * 3)));
        const expenses = Math.round(income * (0.68 + pr(i * 3 + 1) * 0.1));
        const npv      = income - expenses;
        const yoyRaw   = ((pr(i * 3 + 2) > 0.35 ? 1 : -1) * pr(i * 3 + 2) * 20).toFixed(1);
        return {
          period:rowDates[i], cat:pnlCats[i % pnlCats.length],
          income:`$${income.toLocaleString()}`, expenses:`$${expenses.toLocaleString()}`,
          netPnl:`${npv < 0 ? '-' : ''}$${Math.abs(npv).toLocaleString()}`,
          yoy:`${parseFloat(yoyRaw) >= 0 ? '+' : ''}${yoyRaw}%`,
          _neg:npv < 0, _yoyNeg:parseFloat(yoyRaw) < 0,
        };
      });
      columns = [
        { key:'period',   header:'Period',     render:(r) => <span className="text-slate-500 text-xs">{r.period}</span> },
        { key:'cat',      header:'Category',   render:(r) => <span className="font-medium text-slate-800">{r.cat}</span> },
        { key:'income',   header:'Income',     render:(r) => <span className="font-bold text-emerald-700">{r.income}</span> },
        { key:'expenses', header:'Expenses',   render:(r) => <span className="font-semibold text-red-600">{r.expenses}</span> },
        { key:'netPnl',   header:'Net P&L',    render:(r) => <span className={cn('font-bold', r._neg ? 'text-red-600' : 'text-emerald-600')}>{r.netPnl}</span> },
        { key:'yoy',      header:'YoY Change', render:(r) => <span className={cn('text-xs font-semibold', r._yoyNeg ? 'text-red-500' : 'text-emerald-500')}>{r.yoy}</span> },
      ];
      kpis = [
        { label:'Total Revenue',  value:fmtMoney(baseRev),  trend:'+9.4%',  up:true  },
        { label:'Total Expenses', value:fmtMoney(baseCost), trend:'+7.1%',  up:false },
        { label:'Net Profit',     value:fmtMoney(netP),     trend:'+14.2%', up:true  },
        { label:'Profit Margin',  value:`${margin}%`, sub:'vs 22.1% last period', subClass:'text-amber-600' },
      ];
    } else if (sub === 'cashflow') {
      let cumulative = 0;
      const cfCats = ['Operating','Investing','Financing','Operating','Investing'];
      tableRows = Array.from({ length: 25 }, (_, i) => {
        const inflow  = Math.round(baseRev / 25 * (0.6 + pr(i * 3) * 0.5));
        const outflow = Math.round(inflow * (0.6 + pr(i * 3 + 1) * 0.2));
        const net     = inflow - outflow;
        cumulative   += net;
        return {
          date:rowDates[i], cat:cfCats[i % cfCats.length],
          inflow:`$${inflow.toLocaleString()}`, outflow:`$${outflow.toLocaleString()}`,
          net:`${net < 0 ? '-' : ''}$${Math.abs(net).toLocaleString()}`,
          cumulative:`${cumulative < 0 ? '-' : ''}$${Math.abs(cumulative).toLocaleString()}`,
          _neg:net < 0,
        };
      });
      columns = [
        { key:'date',       header:'Date',       render:(r) => <span className="text-slate-500 text-xs">{r.date}</span> },
        { key:'cat',        header:'Category',   render:(r) => <span className="font-medium text-slate-800">{r.cat}</span> },
        { key:'inflow',     header:'Inflow',     render:(r) => <span className="font-bold text-emerald-700">{r.inflow}</span> },
        { key:'outflow',    header:'Outflow',    render:(r) => <span className="font-semibold text-red-600">{r.outflow}</span> },
        { key:'net',        header:'Net Flow',   render:(r) => <span className={cn('font-bold', r._neg ? 'text-red-600' : 'text-emerald-600')}>{r.net}</span> },
        { key:'cumulative', header:'Cumulative', render:(r) => <span className="font-semibold text-slate-700">{r.cumulative}</span> },
      ];
      kpis = [
        { label:'Operating CF',   value:fmtMoney(baseRev * 0.32),  trend:'+8.2%', up:true  },
        { label:'Investing CF',   value:fmtMoney(-baseRev * 0.12), trend:'CapEx',  up:false },
        { label:'Financing CF',   value:fmtMoney(-baseRev * 0.06), trend:'Loans',  up:false },
        { label:'Free Cash Flow', value:fmtMoney(baseRev * 0.14),  sub:'Op. - CapEx', subClass:'text-amber-600' },
      ];
    } else { // revenue (default)
      const txTypes = ['Product Sale','Service Fee','Subscription','Product Sale','Product Refund'];
      tableRows = Array.from({ length: 25 }, (_, i) => {
        const rev    = Math.round(baseRev / 25 * (0.5 + pr(i * 3)));
        const cost   = Math.round(rev * (0.68 + pr(i * 3 + 1) * 0.1));
        const profit = rev - cost;
        return {
          ref:`INV-2024-${String(refBase - i).padStart(4,'0')}`, date:rowDates[i],
          type:txTypes[i % txTypes.length], revenue:`$${rev.toLocaleString()}`,
          cost:`$${cost.toLocaleString()}`,
          profit:`${profit < 0 ? '-' : ''}$${Math.abs(profit).toLocaleString()}`,
          margin:`${(profit / rev * 100).toFixed(1)}%`,
          _neg:profit < 0,
        };
      });
      columns = [
        { key:'ref',     header:'Reference',  render:(r) => <span className="font-mono text-xs font-semibold text-amber-600">{r.ref}</span> },
        { key:'date',    header:'Date',       render:(r) => <span className="text-slate-500 text-xs">{r.date}</span> },
        { key:'type',    header:'Type',       render:(r) => <span className="font-medium text-slate-800">{r.type}</span> },
        { key:'revenue', header:'Revenue',    render:(r) => <span className="font-bold text-slate-900">{r.revenue}</span> },
        { key:'cost',    header:'Cost',       render:(r) => <span className="text-slate-600">{r.cost}</span> },
        { key:'profit',  header:'Net Profit', render:(r) => <span className={cn('font-bold', r._neg ? 'text-red-600' : 'text-emerald-600')}>{r.profit}</span> },
        { key:'margin',  header:'Margin',     render:(r) => <span className="text-slate-700">{r.margin}</span> },
      ];
      kpis = [
        { label:'Total Revenue', value:fmtMoney(baseRev),  trend:'+9.4%',  up:true  },
        { label:'Net Profit',    value:fmtMoney(netP),     trend:'+14.2%', up:true  },
        { label:'Tax Collected', value:fmtMoney(taxAmt),   trend:'+9.4%',  up:true  },
        { label:'Profit Margin', value:`${margin}%`, sub:'vs 22.1% last period', subClass:'text-amber-600' },
      ];
    }

    return {
      kpis, trend,
      trendLines: [{ key:'revenue', label:'Revenue', color:'#F59E0B' }, { key:'cost', label:'Cost', color:'#EF4444', dashed:true }],
      trendLabel: `${subLabel} Trend (${td[0]} – ${td[td.length - 1]})`,
      bars, barsLabel: 'Revenue by Source',
      donut, donutLabel: 'Expense Breakdown', donutCenter: `${fmtMoney(baseCost)}\nCOSTS`,
      tableRows, tableLabel: `${subLabel} Entries`, columns,
    };
  }

  // ── EMPLOYEE ───────────────────────────────────────────────────────────────
  if (reportType === 'employee') {
    let pool = EMP_DATA;
    if (roleFilter) {
      const r = roleFilter.toLowerCase();
      if      (r === 'manager')   pool = pool.filter(e => e.dept === 'Management');
      else if (r === 'cashier')   pool = pool.filter(e => e.dept === 'Cashier');
      else if (r === 'inventory') pool = pool.filter(e => e.dept === 'Inventory');
      else if (r === 'support')   pool = pool.filter(e => e.dept === 'Support');
    }
    if (pool.length === 0) pool = EMP_DATA;
    const scale = days / 30;

    const topEmp    = pool.reduce((best, e) => e.baseSales > best.baseSales ? e : best, pool[0]);
    const totalSales = pool.reduce((s, e) => s + e.baseSales * scale, 0);
    const avgSales   = totalSales / pool.length;
    const totalTxns  = pool.reduce((s, e) => s + Math.round(e.txns * scale), 0);

    const tableRows = [...pool].sort((a, b) => b.baseSales - a.baseSales).map(e => ({
      id: e.id, name: e.name, role: e.role, dept: e.dept,
      sales: fmtMoney(e.baseSales * scale),
      txns: fmtNum(Math.round(e.txns * scale)),
      rating: `${e.rating}/5`,
    }));

    const trend = td.map((date, i) => {
      const p = i / (td.length - 1);
      return { date, sales: Math.round(totalSales * (p * 0.85 + 0.15)), target: Math.round(totalSales * (p * 0.8 + 0.2)) };
    });

    const bars = pool.slice(0, 5).map((e, i) => ({
      name: e.name, amount: fmtMoney(e.baseSales * scale),
      color: ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#F43F5E'][i],
      pct: Math.round(e.baseSales / (pool[0]?.baseSales || 1) * 100),
    }));

    const depts = ['Cashier','Management','Inventory','Support'];
    const deptColors = ['#8B5CF6','#3B82F6','#10B981','#F59E0B'];
    const deptData = depts.map((d, i) => ({
      name: d, value: pool.filter(e => e.dept === d).length, color: deptColors[i],
    })).filter(d => d.value > 0);
    const deptTotal = deptData.reduce((s, d) => s + d.value, 0) || 1;
    const donut = deptData.map(d => ({ ...d, value: Math.round(d.value / deptTotal * 100) }));

    return {
      kpis: [
        { label:'Total Staff',      value:String(pool.length),   trend:'+3 new',  up:true  },
        { label:'Top Performer',    value:topEmp?.name || '—',    sub:fmtMoney(topEmp?.baseSales * scale || 0), subClass:'text-violet-600' },
        { label:'Avg Sales/Staff',  value:fmtMoney(avgSales),    trend:'+6.8%',   up:true  },
        { label:'Total Tx Handled', value:fmtNum(totalTxns),     trend:'+8.2%',   up:true  },
      ],
      trend,
      trendLines: [{ key:'sales', label:'Sales', color:'#8B5CF6' }, { key:'target', label:'Target', color:'#CBD5E1', dashed:true }],
      trendLabel: `Team Sales Performance (${td[0]} – ${td[td.length - 1]})`,
      bars, barsLabel: 'Top Performers by Revenue',
      donut, donutLabel: 'Staff by Department', donutCenter: `${pool.length}\nSTAFF`,
      tableRows, tableLabel: 'Employee Performance',
      columns: [
        { key:'id',     header:'Emp ID',      render:(r) => <span className="font-mono text-xs font-semibold text-violet-600">{r.id}</span> },
        { key:'name',   header:'Employee',    render:(r) => <span className="font-semibold text-slate-900">{r.name}</span> },
        { key:'role',   header:'Role',        render:(r) => <span className="text-slate-600 text-xs">{r.role}</span> },
        { key:'dept',   header:'Department',  render:(r) => <span className="text-slate-500 text-xs">{r.dept}</span> },
        { key:'sales',  header:'Total Sales', render:(r) => <span className="font-bold text-slate-900">{r.sales}</span> },
        { key:'txns',   header:'Transactions',render:(r) => <span className="text-slate-700">{r.txns}</span> },
        { key:'rating', header:'Rating',      render:(r) => <span className="font-semibold text-violet-600">{r.rating}</span> },
      ],
    };
  }

  // ── CUSTOMER ───────────────────────────────────────────────────────────────
  if (reportType === 'customer') {
    let pool = CUST_DATA;
    if (customerSegment) pool = pool.filter(c => c.segment.toLowerCase() === customerSegment.toLowerCase());
    if (loyaltyTier)     pool = pool.filter(c => c.tier.toLowerCase()    === loyaltyTier.toLowerCase());
    if (pool.length === 0) pool = CUST_DATA;
    const scale = days / 30;

    const topSpender  = [...pool].sort((a, b) => b.baseSpend - a.baseSpend)[0];
    const avgSpend    = pool.reduce((s, c) => s + c.baseSpend, 0) / pool.length;
    const totalVisits = pool.reduce((s, c) => s + Math.round(c.visits * scale), 0);
    const baseTotal   = 12480 * nb;
    const newCusts    = Math.round(648 * nb * scale);

    const tableRows = [...pool].sort((a, b) => b.baseSpend - a.baseSpend).map((c, i) => ({
      id: c.id, name: c.name, segment: c.segment, tier: c.tier,
      spend: `$${Math.round(c.baseSpend * scale).toLocaleString()}`,
      visits: Math.round(c.visits * scale),
      lastVisit: genRevDates(dateFrom, dateTo, pool.length)[i],
    }));

    const trend = td.map((date, i) => {
      const p = i / (td.length - 1);
      return { date, new: Math.round(newCusts * (p * 0.7 + 0.05)), returning: Math.round((baseTotal - newCusts) * (p * 0.6 + 0.1)) };
    });

    const bars = [...pool].sort((a, b) => b.baseSpend - a.baseSpend).slice(0, 5).map((c, i) => {
      const parts = c.name.split(' ');
      return {
        name: `${parts[0]} ${parts[1]?.[0] || ''}.`,
        amount: `$${Math.round(c.baseSpend * scale).toLocaleString()}`,
        color: ['#F43F5E','#8B5CF6','#3B82F6','#10B981','#F59E0B'][i],
        pct: Math.round(c.baseSpend / (pool[0]?.baseSpend || 1) * 100),
      };
    });

    const tiers = ['Bronze','Silver','Gold','Platinum'];
    const tierColors = ['#F59E0B','#94A3B8','#EAB308','#8B5CF6'];
    const tierData  = tiers.map((t, i) => ({ name:t, value:CUST_DATA.filter(c => c.tier === t).length, color:tierColors[i] }));
    const tierTotal = tierData.reduce((s, t) => s + t.value, 0) || 1;
    const donut = tierData.map(t => ({ ...t, value: Math.round(t.value / tierTotal * 100) }));

    return {
      kpis: [
        { label:'Total Customers', value:fmtNum(baseTotal),         trend:'+5.3%',   up:true  },
        { label:'Top Spender',     value:topSpender?.name || '—',    sub:`$${Math.round((topSpender?.baseSpend || 0) * scale).toLocaleString()}`, subClass:'text-rose-600' },
        { label:'Avg Spend',       value:`$${avgSpend.toFixed(0)}`,  trend:'+4.8%',   up:true  },
        { label:'Total Visits',    value:fmtNum(totalVisits),        sub:'in period', subClass:'text-rose-600' },
      ],
      trend,
      trendLines: [{ key:'new', label:'New Customers', color:'#F43F5E' }, { key:'returning', label:'Returning', color:'#3B82F6', dashed:true }],
      trendLabel: `Customer Trend (${td[0]} – ${td[td.length - 1]})`,
      bars, barsLabel: 'Top Customers by Spend',
      donut, donutLabel: 'Loyalty Tier Distribution', donutCenter: `${fmtNum(baseTotal)}\nCUSTOMERS`,
      tableRows, tableLabel: 'Customer Activity',
      columns: [
        { key:'id',       header:'Customer ID', render:(r) => <span className="font-mono text-xs font-semibold text-rose-600">{r.id}</span> },
        { key:'name',     header:'Name',        render:(r) => <span className="font-semibold text-slate-900">{r.name}</span> },
        { key:'segment',  header:'Segment',     render:(r) => <span className="text-slate-600 text-xs">{r.segment}</span> },
        { key:'spend',    header:'Total Spend', render:(r) => <span className="font-bold text-slate-900">{r.spend}</span> },
        { key:'visits',   header:'Visits',      render:(r) => <span className="text-slate-700">{r.visits}</span> },
        { key:'lastVisit',header:'Last Visit',  render:(r) => <span className="text-slate-500 text-xs">{r.lastVisit}</span> },
        { key:'tier',     header:'Tier',        render:(r) => <TierBadge tier={r.tier} /> },
      ],
    };
  }

  return { kpis:[], trend:[], trendLines:[], trendLabel:'', bars:[], barsLabel:'', donut:[], donutLabel:'', donutCenter:'', tableRows:[], tableLabel:'', columns:[] };
}

// ─── Display sub-components ───────────────────────────────────────────────────
function KpiCard({ label, value, trend, up, sub, subClass, accentColor }) {
  return (
    <div className="flex-1 min-w-0 border-t-2 pt-4 px-5 pb-5 first:pl-6 last:pr-6" style={{ borderColor: accentColor }}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{label}</p>
      <p className="text-[1.6rem] font-bold text-slate-900 leading-tight mb-1.5 truncate">{value}</p>
      {trend && (
        <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', up ? 'text-emerald-500' : 'text-red-500')}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend}
        </span>
      )}
      {sub && <p className={cn('text-sm font-semibold mt-0.5', subClass || 'text-slate-600')}>{sub}</p>}
    </div>
  );
}

function MetaBit({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      <span className="text-xs text-slate-400">{label}:</span>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function ChipTag({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
    </span>
  );
}

const yFmt = (v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v;

function TrendLineChart({ data, lines }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={yFmt} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12 }}
          formatter={(v) => [typeof v === 'number' && v > 999 ? `$${v.toLocaleString()}` : v]}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color}
            strokeWidth={l.dashed ? 1.5 : 2.5} strokeDasharray={l.dashed ? '5 5' : undefined}
            dot={{ r: 3, fill: l.color, strokeWidth: 0 }} activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function DonutChart({ data, centerText }) {
  const [line1, line2] = centerText.split('\n');
  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
        <PieChart width={160} height={160}>
          <Pie data={data} cx={75} cy={75} innerRadius={52} outerRadius={75} dataKey="value" strokeWidth={2} stroke="#fff">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-900 leading-tight">{line1}</span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-widest">{line2}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-sm text-slate-700 truncate">{d.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ bars }) {
  return (
    <div className="space-y-5">
      {bars.map((b) => (
        <div key={b.name}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700">{b.name}</span>
            <span className="text-sm font-bold text-slate-900">{b.amount}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.pct}%`, background: b.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const ROWS_PER_PAGE  = 10;
const BRANCH_NAMES   = ['Main Branch HQ', 'Downtown Store', 'Westside Outlet'];

export default function ReportViewPage() {
  const { reportType }  = useParams();
  const { state }       = useLocation();
  const meta            = REPORT_META[reportType];
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  if (!meta) return (
    <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
      Unknown report type: <strong className="ml-1">{reportType}</strong>
    </div>
  );

  // ── Unpack router state ──────────────────────────────────────────────────
  const report            = state?.report || {};
  const dateFrom          = state?.dateFrom  || report.filters?.dateFrom  || null;
  const dateTo            = state?.dateTo    || report.filters?.dateTo    || null;
  const allBranches       = state?.allBranches ?? report.filters?.allBranches ?? true;
  const selectedBranchIds = state?.selectedBranchIds || [];
  const additionalFilters = state?.additionalFilters || report.filters?.additionalFilters || {};
  const { stockStatus, financeSubType, roleFilter, customerSegment, loyaltyTier } = additionalFilters;

  const nb              = allBranches ? 3 : Math.max(selectedBranchIds.length, 1);
  const displayBranches = allBranches ? BRANCH_NAMES : BRANCH_NAMES.slice(0, nb);

  // ── Compute all view data once ───────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const vd = useMemo(() => computeViewData({
    reportType, dateFrom, dateTo, displayBranches,
    stockStatus, financeSubType, roleFilter, customerSegment, loyaltyTier,
    savedRows: report.metadata?.totalRows,
  }), [reportType, dateFrom, dateTo, displayBranches.join(','), stockStatus, financeSubType, roleFilter, customerSegment, loyaltyTier]);

  // ── Client-side search ───────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (!search.trim()) return vd.tableRows;
    const q = search.toLowerCase();
    return vd.tableRows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
  }, [vd.tableRows, search]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageRows   = filteredRows.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSearch = (e) => { setSearch(e.target.value); setCurrentPage(1); };

  const handleExportPDF = () =>
    generateReportPDF({
      vd,
      accent: meta.accent,
      reportName: report.name || meta.label,
      dateLabel,
      branchLabel,
      report,
    });

  const pageNums = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, '…', totalPages];
    if (safePage >= totalPages - 2) return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', safePage - 1, safePage, safePage + 1, '…', totalPages];
  })();

  // ── Metadata helpers ─────────────────────────────────────────────────────
  const generatedByName = () => {
    const gb = report.generatedBy;
    if (!gb) return null;
    if (typeof gb === 'object') return `${gb.firstName || ''} ${gb.lastName || ''}`.trim() || null;
    return String(gb);
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  const dateLabel   = (fmtDate(dateFrom) && fmtDate(dateTo))
    ? `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`
    : 'All Time';
  const branchLabel = allBranches ? 'All Branches' : `${nb} Branch${nb !== 1 ? 'es' : ''}`;
  const { Icon }    = meta;

  const hasMetaBar = report.name || generatedByName() || report.metadata?.executionTimeMs || report.status;

  return (
    <div className="space-y-5">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link to="/reports" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Reports</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to={`/reports/configure/${reportType}`} className="text-slate-500 hover:text-blue-600 font-medium transition-colors">{meta.label}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-blue-600 font-semibold">View Report</span>
      </nav>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', meta.iconBg)}>
            <Icon className={cn('w-6 h-6', meta.iconColor)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {report.name || meta.label}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <ChipTag icon={Calendar} label={dateLabel} />
              <ChipTag icon={MapPin} label={branchLabel} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            title="Refresh"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            title="Print"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex items-center gap-1.5 h-9 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* ── Report metadata bar ── */}
      {hasMetaBar && (
        <Card className="px-6 py-3">
          <div className="flex items-center gap-6 flex-wrap">
            {generatedByName() && <MetaBit icon={UserIcon} label="Generated by" value={generatedByName()} />}
            {report.metadata?.executionTimeMs && <MetaBit icon={Clock} label="Time" value={`${report.metadata.executionTimeMs}ms`} />}
            {report.metadata?.fileSize && <MetaBit icon={FileText} label="Size" value={report.metadata.fileSize} />}
            {report.metadata?.totalRows && <MetaBit label="Rows" value={fmtNum(report.metadata.totalRows)} />}
            {report.createdAt && <MetaBit icon={Calendar} label="Generated" value={fmtDate(report.createdAt)} />}
            <span className={cn(
              'ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
              report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
              report.status === 'FAILED'    ? 'bg-red-50 text-red-700' :
                                             'bg-amber-50 text-amber-700'
            )}>
              {report.status || 'COMPLETED'}
            </span>
          </div>
        </Card>
      )}

      {/* ── KPI Row ── */}
      <Card className="overflow-hidden">
        <div className="flex divide-x divide-slate-100">
          {vd.kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} accentColor={meta.accent} />
          ))}
        </div>
      </Card>

      {/* ── Trend Chart ── */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">{vd.trendLabel}</h3>
        {vd.trend.length > 0
          ? <TrendLineChart data={vd.trend} lines={vd.trendLines} />
          : <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No trend data</div>
        }
      </Card>

      {/* ── Category Bars + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">{vd.barsLabel}</h3>
          {vd.bars.length > 0
            ? <CategoryBars bars={vd.bars} />
            : <div className="text-slate-400 text-sm">No data</div>
          }
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">{vd.donutLabel}</h3>
          {vd.donut.length > 0
            ? <DonutChart data={vd.donut} centerText={vd.donutCenter} />
            : <div className="text-slate-400 text-sm">No data</div>
          }
        </Card>
      </div>

      {/* ── Data Table ── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-800">{vd.tableLabel}</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              {fmtNum(filteredRows.length)} {search ? 'FOUND' : 'ROWS'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${vd.tableLabel.toLowerCase()}...`}
                value={search}
                onChange={handleSearch}
                className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 focus:bg-white outline-none transition-all w-56"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>
        </div>

        {pageRows.length > 0
          ? <DataTable columns={vd.columns} data={pageRows} />
          : (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              No results{search ? ` matching "${search}"` : ''}
            </div>
          )
        }

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-wrap gap-3">
          <p className="text-sm text-slate-500">
            {filteredRows.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * ROWS_PER_PAGE + 1}–${Math.min(safePage * ROWS_PER_PAGE, filteredRows.length)} of ${fmtNum(filteredRows.length)} entries`
            }
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNums.map((p, idx) =>
              p === '…' ? (
                <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    safePage === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
