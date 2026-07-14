import React, { useState } from 'react';
import { List, User, Plus, TrendingUp, Users } from 'lucide-react';
import { cn } from '../utils/cn';

// Supplier Management Sub-Pages
import AllSuppliers from '../features/supplier-management/AllSuppliers';
import SupplierProfile from '../features/supplier-management/SupplierProfile';
import AddSupplier from '../features/supplier-management/AddSupplier';
import Performance from '../features/supplier-management/Performance';
import Contacts from '../features/supplier-management/Contacts';

// ─── Tab Configuration ────────────────────────────────────────────────────────
const TABS = [
  { id: 'all',         label: 'All Suppliers',   Icon: List },
  { id: 'profile',     label: 'Supplier Profile', Icon: User },
  { id: 'add',         label: 'Add Supplier',     Icon: Plus },
  { id: 'performance', label: 'Performance',      Icon: TrendingUp },
  { id: 'contacts',    label: 'Contacts',         Icon: Users },
];

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ tab, supplier }) => {
  const crumbs = ['Management', 'Suppliers'];
  if (tab === 'profile' && supplier) crumbs.push(supplier.name);
  if (tab === 'add') crumbs.push('Add Supplier');
  if (tab === 'performance') crumbs.push('Performance Analytics');
  if (tab === 'contacts' && supplier) crumbs.push(supplier.name, 'Contacts');

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>›</span>}
          <span className={i === crumbs.length - 1 ? 'text-slate-600 font-medium' : ''}>{c}</span>
        </React.Fragment>
      ))}
    </nav>
  );
};

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, onTabChange }) => (
  <div className="flex items-center gap-1 border-b border-slate-200 pb-0 mb-6 overflow-x-auto">
    {TABS.map(({ id, label, Icon }) => (
      <button
        key={id}
        onClick={() => onTabChange(id)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-150 -mb-px',
          activeTab === id
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
        )}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    ))}
  </div>
);

// ─── Supplier Page (main tab controller) ─────────────────────────────────────
export default function SupplierPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleViewProfile = (supplier) => {
    setSelectedSupplier(supplier);
    setActiveTab('profile');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <AllSuppliers
            onAddSupplier={() => setActiveTab('add')}
            onViewProfile={handleViewProfile}
          />
        );
      case 'profile':
        return selectedSupplier ? (
          <SupplierProfile
            supplier={selectedSupplier}
            onBack={() => setActiveTab('all')}
            onGoToContacts={() => setActiveTab('contacts')}
            onGoToPerformance={() => setActiveTab('performance')}
          />
        ) : (
          <AllSuppliers
            onAddSupplier={() => setActiveTab('add')}
            onViewProfile={handleViewProfile}
          />
        );
      case 'add':
        return (
          <AddSupplier
            onCancel={() => setActiveTab('all')}
            onComplete={() => setActiveTab('all')}
          />
        );
      case 'performance':
        return <Performance />;
      case 'contacts':
        return <Contacts supplier={selectedSupplier} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <Breadcrumb tab={activeTab} supplier={selectedSupplier} />
      {renderContent()}
    </div>
  );
}
