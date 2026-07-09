import { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import CategoryDashboard from './CategoryDashboard';

export default function CategoryHierarchy({ onBack, onCreate, onEdit }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('tree');

  useEffect(() => {
    categoryService.getTree()
      .then((res) => {
        setTree(res.data.data);
        if (res.data.data.length > 0) {
          setExpanded({ [res.data.data[0]._id]: true });
          setSelected(res.data.data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSelect = async (node) => {
    try {
      const res = await categoryService.getById(node._id);
      setSelected(res.data.data.category);
    } catch {
      setSelected(node);
    }
  };

  const matchesSearch = (name) => name.toLowerCase().includes(search.toLowerCase());

  const renderTreeNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node._id];
    const isSelected = selected?._id === node._id;
    const visible = !search || matchesSearch(node.name) ||
      (hasChildren && node.children.some((c) => matchesSearch(c.name)));
    if (!visible) return null;

    return (
      <div key={node._id}>
        <div
          onClick={() => { handleSelect(node); if (hasChildren) toggleExpand(node._id); }}
          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors mb-0.5 ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-slate-100'}`}
          style={{ marginLeft: depth * 16 }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <span className="text-slate-400 text-xs w-3 flex-shrink-0">{isExpanded ? '▼' : '►'}</span>
            ) : <span className="w-3 flex-shrink-0" />}
            <span className="text-base flex-shrink-0">{node.icon || '📦'}</span>
            <span className={`text-sm truncate ${isSelected ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>{node.name}</span>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
            {node.children?.length > 0 ? `${node.children.length} sub` : '—'}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderTreeNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <button onClick={onBack} className="hover:text-blue-600">Categories</button>
        <span>›</span>
        <span className="text-slate-700 font-medium">Category Hierarchy</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Category Hierarchy</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and manage nested category structure</p>
        </div>
        <button onClick={onCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { key: 'list',      label: 'List View',  icon: '☰' },
          { key: 'tree',      label: 'Tree View',  icon: '🌳' },
          { key: 'analytics', label: 'Analytics',  icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => tab.key === 'list' ? onBack() : setActiveView(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === tab.key ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Analytics View ── */}
      {activeView === 'analytics' && (
        <CategoryDashboard onBack={onBack} onCreate={onCreate} />
      )}

      {/* ── Tree View ── */}
      {activeView === 'tree' && (
        <div className="grid grid-cols-5 gap-4" style={{ minHeight: 500 }}>
          {/* Left: Tree */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Category Tree</h3>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input type="text" placeholder="Search..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 440 }}>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />Loading...
                </div>
              ) : tree.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No categories found</p>
              ) : (
                tree.map((node) => renderTreeNode(node, 0))
              )}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
            {!selected ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Select a category from the tree to view details
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-slate-600">Category Details</h3>
                  {selected.parentId && (
                    <span className="text-xs text-slate-400">
                      {typeof selected.parentId === 'object' ? selected.parentId.name : ''} › {selected.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                    {selected.icon || '📦'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        ● {selected.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                        {selected.parentId ? 'Sub-Category' : 'Parent Category'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{ label: 'Products', value: '—' }, { label: 'Stock Units', value: '—' }, { label: 'Total Value', value: '—' }].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-slate-700">{s.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {selected.parentId && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Parent Category</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                      🗂️ {typeof selected.parentId === 'object' ? selected.parentId.name : selected.parentId}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-5 text-sm">
                  {[
                    { label: 'Created', value: new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    { label: 'Last Updated', value: new Date(selected.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    { label: 'Sort Order', value: String(selected.sortOrder || 1).padStart(2, '0') },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
                      <p className="font-medium text-slate-700">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => onEdit(selected._id)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    ✏️ Edit Category
                  </button>
                  <button onClick={() => onCreate(selected._id)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
                    + Add Sub-Category
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 ml-auto">
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}