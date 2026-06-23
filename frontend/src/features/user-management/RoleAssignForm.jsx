import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { ROLE_LABELS, ROLE_COLORS, ALL_ROLES } from '../../config/roles';

export default function RoleAssignForm({ user, onSubmit, onCancel, isLoading = false }) {
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select a role'); return; }
    if (selectedRole === user?.role) { setError('Please select a different role'); return; }
    onSubmit(selectedRole);
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
            <Badge variant={ROLE_COLORS[user?.role] || 'primary'} className="text-[10px]">
              {ROLE_LABELS[user?.role] || user?.role}
            </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Select New Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => { setSelectedRole(role); setError(''); }}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all duration-150
                  ${selectedRole === role
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }
                  ${role === user?.role ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={role === user?.role}
              >
                <Shield size={14} className={selectedRole === role ? 'text-white' : 'text-slate-400'} />
                <div>
                  <p className="text-xs font-semibold leading-none">{ROLE_LABELS[role]}</p>
                  {role === user?.role && (
                    <p className={`text-[9px] mt-0.5 ${selectedRole === role ? 'text-blue-200' : 'text-slate-400'}`}>
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
          <Button type="submit" variant="primary" disabled={isLoading || !selectedRole} className="min-w-[120px]">
            {isLoading ? 'Assigning...' : 'Assign Role'}
          </Button>
        </div>
      </form>
    </div>
  );
}
