import { useState } from 'react';
import CategoryList from './category/Categorylist';
import CategoryDetail from './category/Categorydetail';
import CategoryCreate from './category/Categorycreate';
import CategoryEdit from './category/Categoryedit';
import CategoryHierarchy from './category/CategoryHierarchy';

export default function CategoryPage() {
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  const goToList      = ()    => { setView('list');      setSelectedId(null); };
  const goToDetail    = (id)  => { setSelectedId(id);    setView('detail'); };
  const goToCreate    = (pid) => { setSelectedId(pid || null); setView('create'); };
  const goToEdit      = (id)  => { setSelectedId(id);    setView('edit'); };
  const goToHierarchy = ()    => setView('hierarchy');

  if (view === 'list')
    return <CategoryList onView={goToDetail} onCreate={goToCreate} onEdit={goToEdit} onHierarchy={goToHierarchy} />;

  if (view === 'detail')
    return <CategoryDetail id={selectedId} onBack={goToList} onEdit={goToEdit} onAddSub={goToCreate} />;

  if (view === 'create')
    return <CategoryCreate onBack={goToList} onSuccess={goToList} />;

  if (view === 'edit')
    return <CategoryEdit id={selectedId} onBack={() => goToDetail(selectedId)} onSuccess={() => goToDetail(selectedId)} />;

  if (view === 'hierarchy')
    return <CategoryHierarchy onBack={goToList} onCreate={goToCreate} onEdit={goToEdit} />;

  return null;
}
