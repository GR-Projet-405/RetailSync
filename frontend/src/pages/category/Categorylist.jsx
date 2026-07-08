import { useState, useEffect, useCallback } from 'react';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

export default function CategoryList({ onView, onCreate, onEdit, onHierarchy }) {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 7, search };
      if (statusFilter !== 'all') params.isActive = statusFilter;
      const res = await categoryService.getAll(params);
      setCategories(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchCategories(1); }, [fetchCategories]);

const handleDelete = async () => {
  try {
    setDeleteLoading(true);
    await categoryService.remove(deleteModal._id);
    toast.success(`"${deleteModal.name}" deactivated successfully!`);
    setDeleteModal(null);
    fetchCategories(pagination.page);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Delete failed');
  } finally {
    setDeleteLoading(false);
  }
};

  const parentCount = categories.filter((c) => !c.parentId).length;
  const subCount = categories.filter((c) => c.parentId).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 mb-1">Inventory › Category Management</p>
          <h1 className="text-2xl font-bold text-slate-800">Category Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage product categories and sub-categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onHierarchy}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
          >
            🌳 Category Hierarchy
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Categories', value: pagination.total, icon: '☰' },
          { label: 'Parent Categories', value: parentCount, icon: '🗂️' },
          { label: 'Sub-Categories', value: subCount, icon: '🗂️' },
          { label: 'Total Products', value: '—', icon: '📦' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">All Categories</h2>
          <div className="flex items-center gap-2">

            {/* ── Status Filter ── */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {[
                { key: 'all',   label: 'All' },
                { key: 'true',  label: '● Active' },
                { key: 'false', label: '● Inactive' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    statusFilter === f.key
                      ? 'bg-white shadow text-slate-800'
                      : 'text-slate-500 hover:text-slate-700'
                  } ${f.key === 'true' && statusFilter === f.key ? 'text-green-600' : ''} ${f.key === 'false' && statusFilter === f.key ? 'text-red-500' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left"><input type="checkbox" /></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No categories found.{' '}
                  <button onClick={onCreate} className="text-blue-600 underline">Create one?</button>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!cat.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3"><input type="checkbox" /></td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon || '📦'}</span>
                      <div>
                        <p className="font-medium text-slate-800">{cat.name}</p>
                        <p className="text-xs text-slate-400">
                          {cat.description?.substring(0, 35)}{cat.description?.length > 35 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cat.parentId ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {cat.parentId ? 'Sub' : 'Parent'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {cat.parentId?.name || <span className="text-slate-300">—</span>}
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-sm">—</td>

                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(cat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onView(cat._id)} title="View"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button onClick={() => onEdit(cat._id)} title="Edit"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteModal(cat)} title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">Showing {categories.length} of {pagination.total} categories</p>
          <div className="flex gap-1">
            <button onClick={() => fetchCategories(pagination.page - 1)} disabled={pagination.page === 1}
              className="w-7 h-7 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">‹</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchCategories(p)}
                className={`w-7 h-7 text-xs rounded ${p === pagination.page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => fetchCategories(pagination.page + 1)} disabled={pagination.page === pagination.pages}
              className="w-7 h-7 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">›</button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">🗑️</div>
              <h3 className="font-semibold text-slate-800">Delete Category?</h3>
            </div>
            <p className="text-sm text-slate-500 mb-1">
<strong className="text-slate-700">{deleteModal.name}</strong> will be deactivated. This action cannot be undone.            </p>
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
              ⚠️ Categories with active sub-categories cannot be deleted. Please deactivate sub-categories first.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60">
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}