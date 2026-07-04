import { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';

export default function CategoryDetail({ id, onBack, onEdit, onAddSub }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    categoryService.getById(id)
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading category details...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        Category not found.{' '}
        <button onClick={onBack} className="text-blue-600 underline">Go back</button>
      </div>
    );
  }

  const { category, children, siblings } = data;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <button onClick={onBack} className="hover:text-blue-600">Categories</button>
        {category.parentId && <><span>›</span><span className="text-slate-500">{category.parentId.name}</span></>}
        <span>›</span>
        <span className="text-slate-700 font-medium">{category.name}</span>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
      >
        ← Back to Categories
      </button>

      {/* Hero Banner */}
      <div
        className="rounded-xl p-6 mb-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
            {category.icon || '📦'}
          </div>
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Category Details</p>
            <h1 className="text-white text-2xl font-bold mb-1">{category.name}</h1>
            <p className="text-blue-100 text-sm mb-3">{category.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${category.isActive ? 'bg-green-400/20 text-green-300 border-green-400/30' : 'bg-red-400/20 text-red-300 border-red-400/30'}`}>
                ● {category.isActive ? 'Active' : 'Inactive'}
              </span>
              {category.parentId ? (
                <>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100">Sub-Category</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100">
                    Under: {category.parentId.name}
                  </span>
                </>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100">Parent Category</span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100">#{category.code}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(id)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onAddSub(id)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            + Add Sub-Category
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: data.stats?.totalProducts ?? 0, change: '+12%', up: true, icon: '📦' },
          { label: 'Stock Units', value: data.stats?.stockUnits ?? 0, change: '+8%', up: true, icon: '📊' },
          { label: 'Inventory Value', value: `LKR ${data.stats?.inventoryValue ?? 0}`, change: '+5%', up: true, icon: '💰' },
          { label: 'Low Stock Items', value: data.stats?.lowStockItems ?? 0, up: false, icon: '⚠️', danger: true },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              {s.change && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${s.up ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {s.change}
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${s.danger && s.value > 0 ? 'text-red-600' : 'text-slate-800'}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info + Siblings */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category Info Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            📋 Category Information
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: 'Category ID', value: `#${category.code}`, color: 'text-blue-600' },
                { label: 'Category Name', value: category.name },
                { label: 'Type', value: category.parentId ? 'Sub-Category' : 'Parent Category', color: 'text-purple-600' },
                { label: 'Parent', value: category.parentId?.name || '—', color: category.parentId ? 'text-orange-500' : '' },
                { label: 'Status', value: category.isActive ? '● Active' : '● Inactive', color: category.isActive ? 'text-green-600' : 'text-red-600' },
                { label: 'Sort Order', value: String(category.sortOrder).padStart(2, '0') },
                { label: 'Created By', value: `${category.createdBy?.firstName || ''} ${category.createdBy?.lastName || ''}`.trim() || '—' },
                { label: 'Created At', value: new Date(category.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'Last Modified', value: new Date(category.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
              ].map((row) => (
                <tr key={row.label} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 text-slate-500 text-sm">{row.label}</td>
                  <td className={`py-2.5 text-right font-medium text-sm ${row.color || 'text-slate-800'}`}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Sibling Sub-Categories */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">🗂️ Sibling Sub-Categories</h3>
              <span className="text-xs text-slate-400">{siblings.length} total</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Self - highlighted */}
              <span className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium">
                {category.icon || '📦'} {category.name}
              </span>
              {/* Siblings */}
              {siblings.map((s) => (
                <span key={s._id} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">
                  {s.icon || '📦'} {s.name}
                </span>
              ))}
              {siblings.length === 0 && (
                <p className="text-sm text-slate-400">No sibling categories</p>
              )}
            </div>

            {/* Children */}
            {children.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Sub-categories under this ({children.length})</p>
                <div className="flex flex-wrap gap-2">
                  {children.map((c) => (
                    <span key={c._id} className="text-sm px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">📝 Category Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {category.description || <span className="text-slate-400">No description provided.</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}