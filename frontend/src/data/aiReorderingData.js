export const summaryCards = [
  {
    id: 1,
    title: "Total Flagged",
    value: 6,
    description: "Products below reorder level",
    color: "blue",
  },
  {
    id: 2,
    title: "Critical",
    value: 2,
    description: "Stockout within 2 days",
    color: "red",
  },
  {
    id: 3,
    title: "Medium",
    value: 3,
    description: "7 days remaining",
    color: "yellow",
  },
  {
    id: 4,
    title: "Low",
    value: 1,
    description: "14 days remaining",
    color: "green",
  },
];

// Recommendation Table
export const recommendationProducts = [
  {
    id: 1,
    product: "Anchor Full Cream Milk Powder 400g",
    branch: "Downtown Flagship",
    stock: 6,
    reorder: 6,
    suggested: 25,
    confidence: 60,
    status: "Critical",
  },
  {
    id: 2,
    product: "Signal Toothpaste 120g",
    branch: "Downtown Flagship",
    stock: 14,
    reorder: 14,
    suggested: 20,
    confidence: 40,
    status: "Critical",
  },
  {
    id: 3,
    product: "Coca-Cola 1.5L",
    branch: "Kandy Central",
    stock: 32,
    reorder: 32,
    suggested: 40,
    confidence: 80,
    status: "Medium",
  },
  {
    id: 4,
    product: "Munchee Marie Biscuits 200g",
    branch: "Galle Fort",
    stock: 18,
    reorder: 18,
    suggested: 25,
    confidence: 50,
    status: "Medium",
  },
  {
    id: 5,
    product: "Sunlight Dishwash Liquid 750ml",
    branch: "Kandy Central",
    stock: 28,
    reorder: 28,
    suggested: 35,
    confidence: 45,
    status: "Medium",
  },
  {
    id: 6,
    product: "Maliban Lemon Puff 200g",
    branch: "Galle Fort",
    stock: 41,
    reorder: 41,
    suggested: 45,
    confidence: 30,
    status: "Low",
  },
];


// Suggested Purchase Summary

export const purchaseSummary = [
  {
    title: "Total Items to Reorder",
    value: 5,
  },
  {
    title: "Suppliers",
    value: 2,
  },
  {
    title: "Estimated Total Cost",
    value: "$3,275.00",
  },
];

// supplier data

export const supplier = {
  name: "Acme Electronics Ltd.",
  email: "orders@acme-elec.com",
  total: "6,070.00",
};

//purchase items
export const purchaseItems = [
  {
    id: 1,
    product: "Wireless Noise-Cancelling Headphones",
    sku: "HD-WNC-01",
    stock: "12 / 15 min",
    status: "Low Stock",
    qty: 50,
    unitCost: "85.00",
    total: "4,250.00",
  },

  {
    id: 2,
    product: "Bluetooth Portable Speaker",
    sku: "SPK-BT-04",
    stock: "8 / 20 min",
    status: "Low Stock",
    qty: 40,
    unitCost: "45.50",
    total: "1,820.00",
  },
];

export const approvalItems = [

  {
    id:1,
    po:"PO-DRAFT-2241",
    status:"Approved",
    confidence:91,
    level:"HIGH",
    amount:"74,300"
  },

  {
    id:2,
    po:"PO-DRAFT-2242",
    status:"Pending",
    confidence:67,
    level:"MEDIUM",
    amount:"31,250"
  },

  {
    id:3,
    po:"PO-DRAFT-2243",
    status:"Approved",
    confidence:51,
    level:"LOW",
    amount:"22,000"
  },

  {
    id:4,
    po:"PO-DRAFT-2244",
    status:"Rejected",
    confidence:48,
    level:"LOW",
    amount:"17,500"
  }

];

//reorder History

export const reorderHistoryItems = [
  {
    id: 1,
    product: "Anchor Full Cream Milk Powder 400g",
    branch: "Downtown Flagship",
    current: 50,
    reordered: 60,
    difference: "+10",
    status: "Modified",
    confidence: 94,
    level: "HIGH",
  },
  {
    id: 2,
    product: "Coca-Cola 1.5L",
    branch: "Kandy Central",
    current: 80,
    reordered: 80,
    difference: "",
    status: "Approved",
    confidence: 76,
    level: "MEDIUM",
  },
  {
    id: 3,
    product: "Munchee Marie Biscuits 200g",
    branch: "Galle Fort",
    current: 50,
    reordered: null,
    difference: "",
    status: "Rejected",
    confidence: 48,
    level: "LOW",
  },
  {
    id: 4,
    product: "Signal Toothpaste 120g",
    branch: "Downtown Flagship",
    current: 40,
    reordered: 40,
    difference: "",
    status: "Approved",
    confidence: 88,
    level: "HIGH",
  },
  {
    id: 5,
    product: "Munchee Marie Biscuits 200g",
    branch: "Downtown Flagship",
    current: 50,
    reordered: null,
    difference: "",
    status: "Rejected",
    confidence: 48,
    level: "LOW",
  },
  {
    id: 6,
    product: "Sunlight Soap 100g",
    branch: "Kandy Central",
    current: 120,
    reordered: 100,
    difference: "-20",
    status: "Modified",
    confidence: 65,
    level: "MEDIUM",
  },
  {
    id: 7,
    product: "Maliban Cream Crackers 500g",
    branch: "Galle Fort",
    current: 30,
    reordered: 30,
    difference: "",
    status: "Approved",
    confidence: 92,
    level: "HIGH",
  },
  {
    id: 8,
    product: "Highland Butter 200g",
    branch: "Downtown Flagship",
    current: 25,
    reordered: 35,
    difference: "+10",
    status: "Modified",
    confidence: 81,
    level: "HIGH",
  },
  {
    id: 9,
    product: "Lifebuoy Soap 100g",
    branch: "Kandy\nCentral",
    current: 150,
    reordered: null,
    difference: "",
    status: "Rejected",
    confidence: 35,
    level: "LOW",
  },
  {
    id: 10,
    product: "Nestomalt 400g",
    branch: "Downtown\nFlagship",
    current: 60,
    reordered: 60,
    difference: "",
    status: "Approved",
    confidence: 85,
    level: "HIGH",
  },
];

// prediction data
export const predictionItems = [
  {
    id: 1,
    product: "Anchor Full Cream Milk Powder 400g",
    branch: "Downtown Flagship",
    current: 6,
    days: 2,
    level: "Critical",
  },

  {
    id: 2,
    product: "Coca-Cola 1.5L",
    branch: "Kandy Central",
    current: 32,
    days: 9,
    level: "Warning",
  },

  {
    id: 3,
    product: "Munchee Marie Biscuits 200g",
    branch: "Downtown Flagship",
    current: 85,
    days: 18,
    level: "Safe",
  },

  {
    id: 4,
    product: "Signal Toothpaste 120g",
    branch: "Galle Fort",
    current: 14,
    days: 4,
    level: "Warning",
  },

  {
    id: 5,
    product: "Sunlight Soap 100g",
    branch: "Kandy Central",
    current: 8,
    days: 3,
    level: "Critical",
  },

  {
    id: 6,
    product: "Maliban Cream Crackers 500g",
    branch: "Galle Fort",
    current: 45,
    days: 12,
    level: "Safe",
  },
];