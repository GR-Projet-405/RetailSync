import { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';


const ICONS_LIST = ['🍔', '📦', '🧴', '🏠', '👕', '💊', '🍎', '🥤', '🧹', '📱', '🎮', '📚'];
const COLORS = ['#3B82F6', '#22C55E', '#EF4444', '#F97316', '#A855F7', '#EC4899', '#06B6D4', '#6B7280'];

export default function CategoryCreate({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentId: '',
    sortOrder: 1,
    isActive: true,
    icon: '📦',
    labelColor: '#3B82F6',
  });
  const [rootCategories, setRootCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll({ limit: 100, isActive: true })
      .then((res) => setRootCategories(res.data.data.filter((c) => !c.parentId)))
      .catch(console.error);
  }, []);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    else if (form.name.trim().length < 2) e.name = 'Must be at least 2 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await categoryService.create({
        name: form.name.trim(),
        description: form.description.trim(),
        parentId: form.parentId || null,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
        icon: form.icon,
        labelColor: form.labelColor,
      });
      toast.success('Category created successfully!');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const previewParent = rootCategories.find((r) => r._id === form.parentId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-blue-600">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create New Category</h1>
          <p className="text-sm text-slate-500">Add a new product category to the system</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <span>Inventory</span><span>›</span>
        <button onClick={onBack} className="hover:text-blue-600">Categories</button>
        <span>›</span>
        <span className="text-slate-700 font-medium">Create Category</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Basic Info */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">📋 Basic Information</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Electronics, Food & Beverages"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                <p className="text-xs text-slate-400 mt-1">Use a clear, descriptive name for easy identification.</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Brief description of this category..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-slate-400 text-right">{form.description.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.parentId ? 'sub' : 'root'}
                    onChange={(e) => { if (e.target.value === 'root') set('parentId', ''); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="root">Parent Category</option>
                    <option value="sub">Sub-Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
                  <select
                    value={form.parentId}
                    onChange={(e) => set('parentId', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— None (Root Category) —</option>
                    {rootCategories.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-500 mt-1">Leave empty to create a root-level category.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number" min={1}
                    value={form.sortOrder}
                    onChange={(e) => set('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Lower numbers appear first in the list.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Active Status</label>
                  <div className="flex items-center gap-3 mt-1">
                    <button type="button" onClick={() => set('isActive', !form.isActive)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="text-sm text-slate-600">{form.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Inactive categories won't appear in POS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Appearance + Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">🎨 Appearance</h3>
              <p className="text-sm font-medium text-slate-600 mb-2">Category Icon</p>
              <div className="grid grid-cols-6 gap-1.5 mb-4">
                {ICONS_LIST.map((ic) => (
                  <button key={ic} type="button" onClick={() => set('icon', ic)}
                    className={`text-xl p-1.5 rounded-lg border-2 transition-all ${form.icon === ic ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}>
                    {ic}
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-600 mb-2">Label Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((col) => (
                  <button key={col} type="button" onClick={() => set('labelColor', col)}
                    className={`w-8 h-8 rounded-full border-4 transition-all ${form.labelColor === col ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: col }} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">👁️ Preview</h3>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">{form.icon}</div>
                <p className="font-semibold text-slate-800 text-sm">{form.name || 'Category Name'}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: form.labelColor }}>
                  {form.parentId ? `Sub-Category • Under: ${previewParent?.name || '...'}` : 'Parent Category'}
                </p>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">How it appears in POS and product lists.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button type="button" onClick={onBack} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="button" className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">Save as Draft</button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Creating...' : '✅ Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}