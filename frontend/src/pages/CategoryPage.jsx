import { useState } from 'react';
import CategoryList from './category/CategoryList';
import CategoryDetail from './category/CategoryDetail';
import CategoryCreate from './category/CategoryCreate';
import CategoryEdit from './category/CategoryEdit';

// View states: 'list' | 'detail' | 'create' | 'edit' | 'hierarchy'
export default function CategoryPage() {
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  const goToList = () => { setView('list'); setSelectedId(null); };
  const goToDetail = (id) => { setSelectedId(id); setView('detail'); };
  const goToCreate = () => setView('create');
  const goToEdit = (id) => { setSelectedId(id); setView('edit'); };
  const goToHierarchy = () => setView('hierarchy');

  if (view === 'list')
    return (
      <CategoryList
        onView={goToDetail}
        onCreate={goToCreate}
        onEdit={goToEdit}
        onHierarchy={goToHierarchy}
      />
    );

  if (view === 'detail')
    return (
      <CategoryDetail
        id={selectedId}
        onBack={goToList}
        onEdit={goToEdit}
        onAddSub={goToCreate}
      />
    );

  if (view === 'create')
    return (
      <CategoryCreate
        onBack={goToList}
        onSuccess={goToList}
      />
    );

  if (view === 'edit')
    return (
      <CategoryEdit
        id={selectedId}
        onBack={() => goToDetail(selectedId)}
        onSuccess={() => goToDetail(selectedId)}
      />
    );

  if (view === 'hierarchy')
    return (
      <CategoryHierarchyPlaceholder onBack={goToList} />
    );

  return null;
}

// Placeholder — hierarchy page later implement karannam
function CategoryHierarchyPlaceholder({ onBack }) {
  return (
    <div className="p-6">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Back</button>
      <div className="text-center py-20 text-slate-400">Category Hierarchy — Coming Soon</div>
    </div>
  );
}