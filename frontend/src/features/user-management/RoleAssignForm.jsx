import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useRoles } from '../../hooks/useRoles';

export default function RoleAssignForm({ user, onSubmit, onCancel, isLoading = false }) {
  const [selectedRoleId, setSelectedRoleId] = useState(user?.roleId?._id || '');
  const [error, setError] = useState('');

  const { data: rolesData } = useRoles();
  const roles = rolesData?.data || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoleId) { setError('Please select a role'); return; }
    if (selectedRoleId === user?.roleId?._id) { setError('Please select a different role'); return; }
    onSubmit(selectedRoleId); // sends ObjectId to parent
  };

  return (
    <div className="space-y-5">
      {/* Current user info */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {user?.firstName} {user?.lastName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-500">Current role:</span>
            <Badge variant="primary" className="text-[10px]">
              {user?.roleId?.name || '—'}
            </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Select New Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <button
                key={role._id}
                type="button"
                onClick={() => { setSelectedRoleId(role._id); setError(''); }}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all duration-150
                  ${selectedRoleId === role._id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }
                  ${role._id === user?.roleId?._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={role._id === user?.roleId?._id}
              >
                <Shield size={14} className={selectedRoleId === role._id ? 'text-white' : 'text-slate-400'} />
                <div>
                  <p className="text-xs font-semibold leading-none">{role.name}</p>
                  {role._id === user?.roleId?._id && (
                    <p className={`text-[9px] mt-0.5 ${selectedRoleId === role._id ? 'text-blue-200' : 'text-slate-400'}`}>
                      Current
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          {error && (
            <p className="flex items-center gap-1 text-xs text-red-600 font-medium mt-2">
              <AlertCircle size={11} /> {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || !selectedRoleId} className="min-w-[120px]">
            {isLoading ? 'Assigning...' : 'Assign Role'}
          </Button>
        </div>
      </form>
    </div>
  );
}