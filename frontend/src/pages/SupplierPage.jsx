import React, { useState, useCallback } from 'react';
import { List, User, Plus, TrendingUp, Users, X, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';

// Supplier Management Sub-Pages
import AllSuppliers from '../features/supplier-management/AllSuppliers';
import SupplierProfile from '../features/supplier-management/SupplierProfile';
import AddSupplier from '../features/supplier-management/AddSupplier';
import Performance from '../features/supplier-management/Performance';
import Contacts from '../features/supplier-management/Contacts';
import { updateSupplier } from '../services/supplierService';

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

// ─── Edit Supplier Modal ──────────────────────────────────────────────────────
// FE-BUG-003: Inline modal for editing supplier core fields
const BUSINESS_TYPES = ['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Farmer/Co-op', 'Service Provider'];
const INDUSTRY_CATS  = ['Raw Materials', 'Electronics', 'Packaging', 'Perishables', 'Components', 'Chemicals', 'Textiles', 'Other'];

const inputCls = 'w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

const EditSupplierModal = ({ supplier, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name:             supplier.name             || '',
    businessType:     supplier.businessType     || '',
    industryCategory: supplier.industryCategory || '',
    country:          supplier.country          || '',
    website:          supplier.website          || '',
    description:      supplier.description      || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())             errs.name             = 'Company name is required';
    if (!form.industryCategory.trim()) errs.industryCategory = 'Industry category is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await updateSupplier(supplier._id, form);
      toast.success('Supplier updated successfully');
      onSaved({ ...supplier, ...form });
    } catch (err) {
      toast.error(err.message || 'Failed to update supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900">Edit Supplier</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Company Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={set('name')} placeholder="Apex Global Trading" className={cn(inputCls, errors.name && 'border-red-400 focus:border-red-400')} />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>

          {/* Business Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Business Type</label>
            <select value={form.businessType} onChange={set('businessType')} className={selectCls}>
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Industry Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Industry Category <span className="text-red-500">*</span></label>
            <select value={form.industryCategory} onChange={set('industryCategory')} className={cn(selectCls, errors.industryCategory && 'border-red-400 focus:border-red-400')}>
              <option value="">Select category...</option>
              {INDUSTRY_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            {errors.industryCategory && <p className="text-xs text-red-500 font-medium">{errors.industryCategory}</p>}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Country</label>
            <input value={form.country} onChange={set('country')} placeholder="United States" className={inputCls} />
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Website</label>
            <input value={form.website} onChange={set('website')} placeholder="https://supplier.com" className={inputCls} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder="Brief description..." className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-60">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Supplier Page (main tab controller) ─────────────────────────────────────
export default function SupplierPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null); // FE-BUG-003
  // Increment to force AllSuppliers to re-fetch after an edit/deactivate
  const [listKey, setListKey] = useState(0);

  const handleViewProfile = (supplier) => {
    setSelectedSupplier(supplier);
    setActiveTab('profile');
  };

  // FE-BUG-003: handler passed to SupplierProfile and AllSuppliers
  const handleEditSupplier = useCallback((supplier) => {
    setEditingSupplier(supplier);
  }, []);

  const handleEditSaved = (updatedSupplier) => {
    // Refresh selected supplier data and close modal
    setSelectedSupplier(updatedSupplier);
    setEditingSupplier(null);
    setListKey(k => k + 1); // re-fetch list
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <AllSuppliers
            key={listKey}
            onAddSupplier={() => setActiveTab('add')}
            onViewProfile={handleViewProfile}
            onEditSupplier={handleEditSupplier}
          />
        );
      case 'profile':
        return selectedSupplier ? (
          <SupplierProfile
            key={selectedSupplier._id}
            supplier={selectedSupplier}
            onBack={() => setActiveTab('all')}
            onGoToContacts={() => setActiveTab('contacts')}
            onGoToPerformance={() => setActiveTab('performance')}
            onEditSupplier={() => handleEditSupplier(selectedSupplier)}
          />
        ) : (
          <AllSuppliers
            key={listKey}
            onAddSupplier={() => setActiveTab('add')}
            onViewProfile={handleViewProfile}
            onEditSupplier={handleEditSupplier}
          />
        );
      case 'add':
        return (
          <AddSupplier
            onCancel={() => setActiveTab('all')}
            onComplete={() => { setListKey(k => k + 1); setActiveTab('all'); }}
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

      {/* FE-BUG-003: Edit Supplier Modal */}
      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
