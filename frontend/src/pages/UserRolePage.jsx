import { useState } from 'react';
import UserListPage from '../features/user-management/UserListPage';
import RoleListPage from '../features/role-management/RoleListPage';
import { Users, ShieldCheck } from 'lucide-react';

export default function UserRolePage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'roles'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={16} />
          Roles & Permissions
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'users' ? <UserListPage /> : <RoleListPage />}
      </div>
    </div>
  );
}
