import InventoryDashboard from '../features/inventory/InventoryDashboard';

/*export default function InventoryPage() {
  return <InventoryDashboard />;
}*/

import React from 'react';

export default function InventoryPage() {
  const inventoryItems = [
    { name: "Wireless Earbuds XT-10", sku: "WE-001", stock: 5, status: "Low Stock", statusColor: "text-red-600 bg-red-50" },
    { name: "Gaming Mouse Pro", sku: "GM-450", stock: 120, status: "In Stock", statusColor: "text-green-600 bg-green-50" },
    { name: "Mechanical Keyboard", sku: "KB-202", stock: 45, status: "In Stock", statusColor: "text-green-600 bg-green-50" },
    { name: "4K Monitor 27\"", sku: "MN-880", stock: 2, status: "Critical", statusColor: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Inventory Management</h2>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">Add New Product</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50">
            <tr><th className="px-6 py-3 font-medium">Product Name</th><th className="px-6 py-3 font-medium">SKU</th><th className="px-6 py-3 font-medium">Stock Qty</th><th className="px-6 py-3 font-medium text-right">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventoryItems.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                <td className="px-6 py-4">{item.sku}</td>
                <td className="px-6 py-4">{item.stock}</td>
                <td className="px-6 py-4 text-right"><span className={`px-3 py-1 rounded-full text-xs font-medium ${item.statusColor}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
