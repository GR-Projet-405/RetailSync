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

// ─── Data computation (pure, no JSX) ─────────────────────────────────────────
// Returns: { kpis, trend, trendLines, trendLabel, bars, barsLabel, donut, donutLabel,
//            donutCenter, tableRows, tableLabel, columns: [{key, header}] }

export function computeReportData({
  reportType, dateFrom, dateTo, displayBranches,
  stockStatus, financeSubType, roleFilter, customerSegment, loyaltyTier, savedRows,
}) {
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
      trend, trendLines:[{key:'revenue',label:'Revenue',color:'#3B82F6'},{key:'target',label:'Target',color:'#CBD5E1',dashed:true}],
      trendLabel:`Revenue Trend (${td[0]} – ${td[td.length-1]})`,
      bars, barsLabel:'Top Product Categories',
      donut, donutLabel:'Revenue by Branch', donutCenter:`${fmtMoney(totalRev)}\nTOTAL`,
      tableRows, tableLabel:'Sales Transactions',
      columns:[
        {key:'id',       header:'Order ID'},
        {key:'date',     header:'Date'},
        {key:'customer', header:'Customer'},
        {key:'branch',   header:'Branch'},
        {key:'category', header:'Category'},
        {key:'amount',   header:'Amount'},
        {key:'status',   header:'Status'},
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
      sku: it.sku, name: it.name, stock: String(it.qty), branch: it.branch,
      status: it.qty === 0 ? 'OUT OF STOCK' : it.qty <= 10 ? 'LOW STOCK' : 'IN STOCK',
      value: it.unitValue,
    }));
    return {
      kpis:[
        {label:'Total SKUs',      value:fmtNum(totalSKUs),   trend:'+3.2%',               up:true},
        {label:'Low Stock Items', value:String(lowStock),     trend:`${lowStock} flagged`,  up:false},
        {label:'Out of Stock',    value:String(outOfStock),   trend:`${outOfStock} items`,  up:outOfStock===0},
        {label:'Stock Value',     value:fmtMoney(stockValue), sub:'Total inventory value',  subClass:'text-emerald-600'},
      ],
      trend, trendLines:[{key:'stock',label:'Total Stock',color:'#10B981'},{key:'reorder',label:'Reorder Zone',color:'#F59E0B',dashed:true}],
      trendLabel:`Stock Level Trend (${td[0]} – ${td[td.length-1]})`,
      bars, barsLabel:'Stock by Category',
      donut, donutLabel:'Stock by Branch', donutCenter:`${fmtNum(totalSKUs)}\nSKUs`,
      tableRows, tableLabel:'Inventory Items',
      columns:[
        {key:'sku',    header:'SKU'},
        {key:'name',   header:'Product'},
        {key:'stock',  header:'Qty'},
        {key:'branch', header:'Branch'},
        {key:'status', header:'Status'},
        {key:'value',  header:'Unit Value'},
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
      {name:'Product Sales', amount:fmtMoney(baseRev*0.698), color:'#F59E0B', pct:100},
      {name:'Service Fees',  amount:fmtMoney(baseRev*0.190), color:'#10B981', pct:27},
      {name:'Subscriptions', amount:fmtMoney(baseRev*0.112), color:'#3B82F6', pct:16},
    ];
    const donut = [
      {name:'COGS',value:52,color:'#F59E0B'},{name:'Operating',value:28,color:'#EF4444'},
      {name:'Tax',value:13,color:'#3B82F6'},{name:'Other',value:7,color:'#CBD5E1'},
    ];
    const refBase  = 421 + Math.floor(days * nb);
    const rowDates = genRevDates(dateFrom, dateTo, 25);
    const subLabel = {revenue:'Revenue Report',tax:'Tax Report',pnl:'P&L Report',cashflow:'Cash Flow Report'}[sub] || 'Finance Report';
    let tableRows, columns, kpis;
    if (sub === 'tax') {
      const taxCats = ['Product Sales','Service Fees','Digital Goods','Import Duties','Luxury Tax'];
      tableRows = Array.from({length:25}, (_, i) => {
        const gross = Math.round(baseRev/25*(0.5+pr(i*3)));
        const rate  = [10,12,8,15,18][i%5];
        const tamt  = Math.round(gross*rate/100);
        return {ref:`TAX-2024-${String(refBase-i).padStart(4,'0')}`,date:rowDates[i],cat:taxCats[i%taxCats.length],grossRev:`$${gross.toLocaleString()}`,taxRate:`${rate}%`,taxAmt:`$${tamt.toLocaleString()}`,netRev:`$${(gross-tamt).toLocaleString()}`};
      });
      columns = [{key:'ref',header:'Reference'},{key:'date',header:'Date'},{key:'cat',header:'Category'},{key:'grossRev',header:'Gross Revenue'},{key:'taxRate',header:'Tax Rate'},{key:'taxAmt',header:'Tax Amount'},{key:'netRev',header:'Net Revenue'}];
      kpis = [{label:'Tax Collected',value:fmtMoney(taxAmt),trend:'+9.4%',up:true},{label:'Avg Tax Rate',value:'10.0%',trend:'Standard',up:true},{label:'Gross Revenue',value:fmtMoney(baseRev),trend:'+9.4%',up:true},{label:'Net After Tax',value:fmtMoney(baseRev-taxAmt),sub:'Post-tax',subClass:'text-amber-600'}];
    } else if (sub === 'pnl') {
      const pnlCats = ['Electronics','Home & Living','Fashion','Beverages','Bakery'];
      tableRows = Array.from({length:25}, (_, i) => {
        const income=Math.round(baseRev/25*(0.5+pr(i*3)));
        const expenses=Math.round(income*(0.68+pr(i*3+1)*0.1));
        const npv=income-expenses;
        const yoyRaw=((pr(i*3+2)>0.35?1:-1)*pr(i*3+2)*20).toFixed(1);
        return {period:rowDates[i],cat:pnlCats[i%pnlCats.length],income:`$${income.toLocaleString()}`,expenses:`$${expenses.toLocaleString()}`,netPnl:`${npv<0?'-':''}$${Math.abs(npv).toLocaleString()}`,yoy:`${parseFloat(yoyRaw)>=0?'+':''}${yoyRaw}%`};
      });
      columns = [{key:'period',header:'Period'},{key:'cat',header:'Category'},{key:'income',header:'Income'},{key:'expenses',header:'Expenses'},{key:'netPnl',header:'Net P&L'},{key:'yoy',header:'YoY Change'}];
      kpis = [{label:'Total Revenue',value:fmtMoney(baseRev),trend:'+9.4%',up:true},{label:'Total Expenses',value:fmtMoney(baseCost),trend:'+7.1%',up:false},{label:'Net Profit',value:fmtMoney(netP),trend:'+14.2%',up:true},{label:'Profit Margin',value:`${margin}%`,sub:'vs 22.1% last period',subClass:'text-amber-600'}];
    } else if (sub === 'cashflow') {
      let cum = 0;
      const cfCats = ['Operating','Investing','Financing','Operating','Investing'];
      tableRows = Array.from({length:25}, (_, i) => {
        const inflow=Math.round(baseRev/25*(0.6+pr(i*3)*0.5));
        const outflow=Math.round(inflow*(0.6+pr(i*3+1)*0.2));
        const net=inflow-outflow;
        cum+=net;
        return {date:rowDates[i],cat:cfCats[i%cfCats.length],inflow:`$${inflow.toLocaleString()}`,outflow:`$${outflow.toLocaleString()}`,net:`${net<0?'-':''}$${Math.abs(net).toLocaleString()}`,cumulative:`${cum<0?'-':''}$${Math.abs(cum).toLocaleString()}`};
      });
      columns = [{key:'date',header:'Date'},{key:'cat',header:'Category'},{key:'inflow',header:'Inflow'},{key:'outflow',header:'Outflow'},{key:'net',header:'Net Flow'},{key:'cumulative',header:'Cumulative'}];
      kpis = [{label:'Operating CF',value:fmtMoney(baseRev*0.32),trend:'+8.2%',up:true},{label:'Investing CF',value:fmtMoney(-baseRev*0.12),trend:'CapEx',up:false},{label:'Financing CF',value:fmtMoney(-baseRev*0.06),trend:'Loans',up:false},{label:'Free Cash Flow',value:fmtMoney(baseRev*0.14),sub:'Op. - CapEx',subClass:'text-amber-600'}];
    } else {
      const txTypes = ['Product Sale','Service Fee','Subscription','Product Sale','Product Refund'];
      tableRows = Array.from({length:25}, (_, i) => {
        const rev=Math.round(baseRev/25*(0.5+pr(i*3)));
        const cost=Math.round(rev*(0.68+pr(i*3+1)*0.1));
        const profit=rev-cost;
        return {ref:`INV-2024-${String(refBase-i).padStart(4,'0')}`,date:rowDates[i],type:txTypes[i%txTypes.length],revenue:`$${rev.toLocaleString()}`,cost:`$${cost.toLocaleString()}`,profit:`${profit<0?'-':''}$${Math.abs(profit).toLocaleString()}`,margin:`${(profit/rev*100).toFixed(1)}%`};
      });
      columns = [{key:'ref',header:'Reference'},{key:'date',header:'Date'},{key:'type',header:'Type'},{key:'revenue',header:'Revenue'},{key:'cost',header:'Cost'},{key:'profit',header:'Net Profit'},{key:'margin',header:'Margin'}];
      kpis = [{label:'Total Revenue',value:fmtMoney(baseRev),trend:'+9.4%',up:true},{label:'Net Profit',value:fmtMoney(netP),trend:'+14.2%',up:true},{label:'Tax Collected',value:fmtMoney(taxAmt),trend:'+9.4%',up:true},{label:'Profit Margin',value:`${margin}%`,sub:'vs 22.1% last period',subClass:'text-amber-600'}];
    }
    return {
      kpis, trend,
      trendLines:[{key:'revenue',label:'Revenue',color:'#F59E0B'},{key:'cost',label:'Cost',color:'#EF4444',dashed:true}],
      trendLabel:`${subLabel} Trend (${td[0]} – ${td[td.length-1]})`,
      bars, barsLabel:'Revenue by Source',
      donut, donutLabel:'Expense Breakdown', donutCenter:`${fmtMoney(baseCost)}\nCOSTS`,
      tableRows, tableLabel:`${subLabel} Entries`, columns,
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
    const scale      = days / 30;
    const topEmp     = pool.reduce((b, e) => e.baseSales > b.baseSales ? e : b, pool[0]);
    const totalSales = pool.reduce((s, e) => s + e.baseSales * scale, 0);
    const avgSales   = totalSales / pool.length;
    const totalTxns  = pool.reduce((s, e) => s + Math.round(e.txns * scale), 0);
    const trend = td.map((date, i) => {
      const p = i / (td.length - 1);
      return { date, sales: Math.round(totalSales * (p * 0.85 + 0.15)), target: Math.round(totalSales * (p * 0.8 + 0.2)) };
    });
    const bars = pool.slice(0,5).map((e,i) => ({
      name:e.name, amount:fmtMoney(e.baseSales*scale),
      color:['#8B5CF6','#3B82F6','#10B981','#F59E0B','#F43F5E'][i],
      pct:Math.round(e.baseSales/(pool[0]?.baseSales||1)*100),
    }));
    const depts=['Cashier','Management','Inventory','Support'];
    const deptColors=['#8B5CF6','#3B82F6','#10B981','#F59E0B'];
    const deptData=depts.map((d,i)=>({name:d,value:pool.filter(e=>e.dept===d).length,color:deptColors[i]})).filter(d=>d.value>0);
    const deptTotal=deptData.reduce((s,d)=>s+d.value,0)||1;
    const donut=deptData.map(d=>({...d,value:Math.round(d.value/deptTotal*100)}));
    const tableRows=[...pool].sort((a,b)=>b.baseSales-a.baseSales).map(e=>({
      id:e.id,name:e.name,role:e.role,dept:e.dept,
      sales:fmtMoney(e.baseSales*scale),
      txns:fmtNum(Math.round(e.txns*scale)),
      rating:`${e.rating}/5`,
    }));
    return {
      kpis:[
        {label:'Total Staff',      value:String(pool.length),  trend:'+3 new', up:true},
        {label:'Top Performer',    value:topEmp?.name||'—',     sub:fmtMoney(topEmp?.baseSales*scale||0), subClass:'text-violet-600'},
        {label:'Avg Sales/Staff',  value:fmtMoney(avgSales),   trend:'+6.8%',  up:true},
        {label:'Total Tx Handled', value:fmtNum(totalTxns),    trend:'+8.2%',  up:true},
      ],
      trend,trendLines:[{key:'sales',label:'Sales',color:'#8B5CF6'},{key:'target',label:'Target',color:'#CBD5E1',dashed:true}],
      trendLabel:`Team Sales Performance (${td[0]} – ${td[td.length-1]})`,
      bars,barsLabel:'Top Performers by Revenue',
      donut,donutLabel:'Staff by Department',donutCenter:`${pool.length}\nSTAFF`,
      tableRows,tableLabel:'Employee Performance',
      columns:[{key:'id',header:'Emp ID'},{key:'name',header:'Employee'},{key:'role',header:'Role'},{key:'dept',header:'Department'},{key:'sales',header:'Total Sales'},{key:'txns',header:'Transactions'},{key:'rating',header:'Rating'}],
    };
  }

  // ── CUSTOMER ───────────────────────────────────────────────────────────────
  if (reportType === 'customer') {
    let pool = CUST_DATA;
    if (customerSegment) pool = pool.filter(c => c.segment.toLowerCase() === customerSegment.toLowerCase());
    if (loyaltyTier)     pool = pool.filter(c => c.tier.toLowerCase()    === loyaltyTier.toLowerCase());
    if (pool.length === 0) pool = CUST_DATA;
    const scale      = days / 30;
    const topSpender = [...pool].sort((a,b)=>b.baseSpend-a.baseSpend)[0];
    const avgSpend   = pool.reduce((s,c)=>s+c.baseSpend,0)/pool.length;
    const totalVisits= pool.reduce((s,c)=>s+Math.round(c.visits*scale),0);
    const baseTotal  = 12480 * nb;
    const newCusts   = Math.round(648*nb*scale);
    const trend = td.map((date,i)=>{
      const p=i/(td.length-1);
      return {date,new:Math.round(newCusts*(p*0.7+0.05)),returning:Math.round((baseTotal-newCusts)*(p*0.6+0.1))};
    });
    const bars=[...pool].sort((a,b)=>b.baseSpend-a.baseSpend).slice(0,5).map((c,i)=>{
      const parts=c.name.split(' ');
      return {name:`${parts[0]} ${parts[1]?.[0]||''}.`,amount:`$${Math.round(c.baseSpend*scale).toLocaleString()}`,color:['#F43F5E','#8B5CF6','#3B82F6','#10B981','#F59E0B'][i],pct:Math.round(c.baseSpend/(pool[0]?.baseSpend||1)*100)};
    });
    const tiers=['Bronze','Silver','Gold','Platinum'];
    const tierColors=['#F59E0B','#94A3B8','#EAB308','#8B5CF6'];
    const tierData=tiers.map((t,i)=>({name:t,value:CUST_DATA.filter(c=>c.tier===t).length,color:tierColors[i]}));
    const tierTotal=tierData.reduce((s,t)=>s+t.value,0)||1;
    const donut=tierData.map(t=>({...t,value:Math.round(t.value/tierTotal*100)}));
    const tableRows=[...pool].sort((a,b)=>b.baseSpend-a.baseSpend).map((c,i)=>({
      id:c.id,name:c.name,segment:c.segment,tier:c.tier,
      spend:`$${Math.round(c.baseSpend*scale).toLocaleString()}`,
      visits:String(Math.round(c.visits*scale)),
      lastVisit:genRevDates(dateFrom,dateTo,pool.length)[i],
    }));
    return {
      kpis:[
        {label:'Total Customers',value:fmtNum(baseTotal),         trend:'+5.3%', up:true},
        {label:'Top Spender',    value:topSpender?.name||'—',      sub:`$${Math.round((topSpender?.baseSpend||0)*scale).toLocaleString()}`,subClass:'text-rose-600'},
        {label:'Avg Spend',      value:`$${avgSpend.toFixed(0)}`,  trend:'+4.8%', up:true},
        {label:'Total Visits',   value:fmtNum(totalVisits),        sub:'in period',subClass:'text-rose-600'},
      ],
      trend,trendLines:[{key:'new',label:'New Customers',color:'#F43F5E'},{key:'returning',label:'Returning',color:'#3B82F6',dashed:true}],
      trendLabel:`Customer Trend (${td[0]} – ${td[td.length-1]})`,
      bars,barsLabel:'Top Customers by Spend',
      donut,donutLabel:'Loyalty Tier Distribution',donutCenter:`${fmtNum(baseTotal)}\nCUSTOMERS`,
      tableRows,tableLabel:'Customer Activity',
      columns:[{key:'id',header:'Customer ID'},{key:'name',header:'Name'},{key:'segment',header:'Segment'},{key:'spend',header:'Total Spend'},{key:'visits',header:'Visits'},{key:'lastVisit',header:'Last Visit'},{key:'tier',header:'Tier'}],
    };
  }

  return { kpis:[], trend:[], trendLines:[], trendLabel:'', bars:[], barsLabel:'', donut:[], donutLabel:'', donutCenter:'', tableRows:[], tableLabel:'', columns:[] };
}

// ─── Shared PDF generator ─────────────────────────────────────────────────────
// vd        – output of computeReportData (or the existing vd from ReportViewPage)
// accent    – hex color for the report type (e.g. '#3B82F6')
// reportName – display name
// dateLabel  – e.g. 'Jun 1, 2026 – Jun 30, 2026'
// branchLabel – e.g. 'All Branches'
// report    – raw report object from API (optional, for metadata row)

export async function generateReportPDF({ vd, accent, reportName, dateLabel, branchLabel, report = {} }) {
  const { default: jsPDF }     = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc   = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // ── Accent color split into RGB ─────────────────────────────────────────
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  };
  const [ar,ag,ab] = hexToRgb(accent);

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(ar, ag, ab);
  doc.rect(0, 0, pageW, 56, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportName, 36, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateLabel}   |   ${branchLabel}`, 36, 46);

  const generatedOn = new Date().toLocaleString('en-US', {
    month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit',
  });
  doc.text(`Generated: ${generatedOn}`, pageW - 36, 46, { align: 'right' });

  // ── KPI cards ────────────────────────────────────────────────────────────
  const kpiCount = vd.kpis.length || 1;
  const kpiW     = (pageW - 72) / kpiCount;
  const kpiY     = 68;
  const kpiH     = 54;

  vd.kpis.forEach((kpi, i) => {
    const x = 36 + i * kpiW;
    doc.setDrawColor(220, 220, 230);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(x, kpiY, kpiW - 6, kpiH, 4, 4, 'FD');

    doc.setFillColor(ar, ag, ab);
    doc.roundedRect(x, kpiY, kpiW - 6, 3, 1, 1, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.label.toUpperCase(), x + 8, kpiY + 16);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(String(kpi.value), x + 8, kpiY + 33);

    const sub = kpi.trend || kpi.sub;
    if (sub) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const isUp = kpi.up !== false;
      doc.setTextColor(isUp ? 16 : 220, isUp ? 185 : 38, isUp ? 129 : 38);
      doc.text(String(sub), x + 8, kpiY + 47);
    }
  });

  // ── Section: Trend summary (text only) ──────────────────────────────────
  let y = kpiY + kpiH + 14;

  if (vd.bars && vd.bars.length > 0) {
    doc.setDrawColor(226, 232, 240);
    doc.line(36, y, pageW - 36, y);
    y += 14;

    // Two columns: bars left, donut right
    const colW = (pageW - 72 - 10) / 2;

    // ── Left: top categories/performers ─────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(vd.barsLabel, 36, y);
    y += 12;

    vd.bars.forEach((b, i) => {
      const bx = 36;
      const by = y + i * 18;
      const [br, bg, bb] = hexToRgb(b.color);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(b.name, bx, by + 7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(b.amount, bx + colW - 10, by + 7, { align: 'right' });

      // bar background
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(bx, by + 9, colW - 14, 5, 2, 2, 'F');
      // bar fill
      doc.setFillColor(br, bg, bb);
      doc.roundedRect(bx, by + 9, Math.max(2, (colW - 14) * b.pct / 100), 5, 2, 2, 'F');
    });

    // ── Right: donut breakdown (legend only) ────────────────────────────
    const rx = 36 + colW + 20;
    let ry = y;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(vd.donutLabel, rx, ry);
    ry += 12;

    vd.donut.forEach((d) => {
      const [dr, dg, db] = hexToRgb(d.color);
      doc.setFillColor(dr, dg, db);
      doc.circle(rx + 5, ry + 3, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(d.name, rx + 14, ry + 7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${d.value}%`, rx + colW - 6, ry + 7, { align: 'right' });
      ry += 16;
    });

    y += vd.bars.length * 18 + 14;
  }

  // ── Data table ───────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.line(36, y, pageW - 36, y);
  y += 12;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(vd.tableLabel, 36, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${vd.tableRows.length} records`, pageW - 36, y, { align: 'right' });
  y += 10;

  const cols    = (vd.columns || []).filter(c => !c.key.startsWith('_'));
  const headers = cols.map(c => c.header);
  const rows    = vd.tableRows.map(row =>
    cols.map(c => {
      const val = row[c.key];
      return (val === null || val === undefined) ? '' : String(val);
    })
  );

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: 36, right: 36 },
    styles: { fontSize: 7.5, cellPadding: 4, textColor: [30,41,59], lineColor: [226,232,240], lineWidth: 0.5 },
    headStyles: { fillColor: [ar,ag,ab], textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248,250,252] },
    tableLineColor: [226,232,240],
    tableLineWidth: 0.5,
  });

  // ── Footer on every page ─────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.line(36, pageH - 24, pageW - 36, pageH - 24);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('RetailSync — Confidential Report', 36, pageH - 12);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 36, pageH - 12, { align: 'right' });
  }

  const fileName = reportName.replace(/\s+/g, '_');
  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
