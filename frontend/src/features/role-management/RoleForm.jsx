import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';

// Flatten PERMISSIONS for simple checkbox rendering
// If there's an actual PERMISSIONS object in config/permissions, we should import it.
// For now, let's mock the available permissions based on the system logic,
// or we can just fetch permissions if there was an endpoint, but standard ones:
const AVAILABLE_PERMISSIONS = [
  'CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER',
  'CREATE_ROLE', 'READ_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE',
  'CREATE_BRANCH', 'READ_BRANCH', 'UPDATE_BRANCH', 'DELETE_BRANCH',
  'CREATE_PRODUCT', 'READ_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
  'PROCESS_SALE', 'VIEW_REPORTS'
];

export default function RoleForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        permissions: initialData.permissions || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePermissionToggle = (perm) => {
    setFormData(prev => {
      if (prev.permissions.includes(perm)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      }
      return { ...prev, permissions: [...prev.permissions, perm] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            disabled={initialData?.isSystemRole}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. ASSISTANT_MANAGER"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 uppercase"
          />
          {initialData?.isSystemRole && (
            <p className="text-xs text-amber-600 mt-1">System role names cannot be changed.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What does this role do?"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Permissions
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
            {AVAILABLE_PERMISSIONS.map(perm => (
              <label key={perm} className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-100 p-1.5 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(perm)}
                  onChange={() => handlePermissionToggle(perm)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {perm.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Save Changes' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
}
