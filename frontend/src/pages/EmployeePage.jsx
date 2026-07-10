import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  UserPlus, RefreshCw, Eye, Pencil, Trash2, KeyRound,
  Power, Shield, Users, UserCheck, UserX, ChevronLeft,
  ChevronRight, Filter, MoreVertical, CheckCircle2, XCircle,
  AlertCircle, Building2, MapPin, Mail, Phone, Calendar
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchInput from '../components/SearchInput';
import Card from '../components/Card';
import UserForm from '../features/user-management/UserForm';
import UserDetailView from '../features/user-management/UserDetailView';
import ResetPasswordForm from '../features/user-management/ResetPasswordForm';
import RoleAssignForm from '../features/user-management/RoleAssignForm';
import { ROLE_LABELS, ROLE_COLORS, ALL_ROLES } from '../config/roles';
import { useAuth } from '../contexts/AuthContext';
import { useBranches } from '../hooks/useBranches';
import { useRoles } from '../hooks/useRoles';
import {
  useUsers,
  useUserStats,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
  useResetUserPassword,
  useUpdateUserRole,
} from '../hooks/useUsers';

// ─── Inline Toast Utility ──────────────────────────────
const _showToast = (msg, type) => {
  const colors = { success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB' };
  const bgColors = { success: '#F0FDF4', error: '#FEF2F2', warning: '#FFFBEB', info: '#EFF6FF' };
  const borders = { success: '#86EFAC', error: '#FCA5A5', warning: '#FCD34D', info: '#93C5FD' };
  let c = document.getElementById('_rs_toast');
  if (!c) { c = document.createElement('div'); c.id = '_rs_toast'; Object.assign(c.style, { position:'fixed', top:'20px', right:'20px', zIndex:'9999', display:'flex', flexDirection:'column', gap:'8px', maxWidth:'360px', width:'100%', pointerEvents:'none' }); document.body.appendChild(c); }
  const el = document.createElement('div');
  Object.assign(el.style, { display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background: bgColors[type], border: `1px solid ${borders[type]}`, borderRadius:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', pointerEvents:'all', opacity:'0', transform:'translateX(20px)', transition:'opacity 200ms ease, transform 200ms ease', cursor:'pointer' });
  el.innerHTML = `<span style="font-size:13px;font-weight:500;color:${colors[type]};line-height:1.4;flex:1">${msg}</span>`;
  const dismiss = () => { el.style.opacity='0'; el.style.transform='translateX(20px)'; setTimeout(()=>el.remove(),200); };
  el.addEventListener('click', dismiss);
  c.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity='1'; el.style.transform='translateX(0)'; });
  setTimeout(dismiss, 4000);
};
const toast = { success: (m) => _showToast(m,'success'), error: (m) => _showToast(m,'error'), warning: (m) => _showToast(m,'warning'), info: (m) => _showToast(m,'info') };

const STATUS_CONFIG = {
  ACTIVE:    { variant: 'success', icon: CheckCircle2, label: 'Active' },
  INACTIVE:  { variant: 'neutral', icon: XCircle,      label: 'Inactive' },
  SUSPENDED: { variant: 'danger',  icon: AlertCircle,  label: 'Suspended' },
  PENDING:   { variant: 'warning', icon: AlertCircle,  label: 'Pending' }
};

const MODAL_TYPES = {
  CREATE:         'CREATE',
  EDIT:           'EDIT',
  VIEW:           'VIEW',
  DELETE:         'DELETE',
  RESET_PASSWORD: 'RESET_PASSWORD',
  TOGGLE_STATUS:  'TOGGLE_STATUS',
  ASSIGN_ROLE:    'ASSIGN_ROLE',
};

const PAGE_SIZE_OPTIONS = [12, 24, 48];



function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <Card hover className="overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} ${color}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-800 leading-none mt-1.5">{value ?? '—'}</p>
        </div>
      </div>
    </Card>
  );
}

function ActionMenu({ user, onView, onEdit, onDelete, onResetPw, onToggleStatus, onAssignRole, hasPermission,canChangeRole }) {
  const [open, setOpen] = useState(false);
  const isActive = user.status === 'ACTIVE';

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-[34px] h-[34px] shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors shadow-sm"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1 fade-in overflow-hidden">
           {[
              { icon: KeyRound, label: 'Reset Password', action: onResetPw, style: 'text-amber-600 hover:bg-amber-50' },
              { icon: Power, label: isActive ? 'Suspend' : 'Activate', action: onToggleStatus, style: isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50' },
              { icon: Trash2, label: 'Deactivate Employee', action: onDelete, style: 'text-red-600 hover:bg-red-50', divider: true, reqPerm: true },
            ].map(({ icon: Icon, label, action, style, divider, reqPerm }) => {
              if (reqPerm && !hasPermission) return null;
                return (
                <div key={label}>
                  {divider && <div className="h-px bg-slate-100 my-1" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpen(false); action(); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors duration-100 ${style}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function EmployeePage() {
  const { hasRole, user } = useAuth();
  const { data: branchesData } = useBranches();
  const branches = branchesData || [];

  const { data: rolesData } = useRoles();
  const allRoles = rolesData?.data || [];

  const BRANCH_MANAGER_ALLOWED_ROLES = ['CASHIER', 'INVENTORY_MANAGER'];
  const roles = hasRole('BRANCH_MANAGER')
  ? allRoles.filter(r => BRANCH_MANAGER_ALLOWED_ROLES.includes(r.name))
  : allRoles;

  const isSuperAdminOrAdmin = hasRole('SUPER_ADMIN', 'ADMIN');
  const isBranchManager = hasRole('BRANCH_MANAGER');
  const canAddEmployee = isSuperAdminOrAdmin || isBranchManager;
  
  const [filters, setFilters] = useState({
    search: '',
    roleId: '',
    status: '',
    branchId: '',
    page: 1,
    limit: 12,
  });

  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState({ type: null, user: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useUsers(filters);
  const { data: statsData } = useUserStats();

  const employees = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};
  const stats = statsData?.data?.summary || {};

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();
  const resetPw = useResetUserPassword();
  const updateRole = useUpdateUserRole();

  const openModal = useCallback((type, user = null) => setModal({ type, user }), []);
  const closeModal = useCallback(() => setModal({ type: null, user: null }), []);

  const setFilter = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = async (payload) => {
    try {
      await createUser.mutateAsync(payload);
      toast.success('Employee created successfully');
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateUser.mutateAsync({ id: modal.user._id, data: payload });
      toast.success('Employee updated successfully');
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(modal.user._id);
      toast.success('Employee deactivated successfully');
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = modal.user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateStatus.mutateAsync({ id: modal.user._id, status: newStatus });
      toast.success(`Employee ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResetPassword = async (newPassword, confirmPassword) => {
    try {
      await resetPw.mutateAsync({ id: modal.user._id, newPassword, confirmPassword });
      toast.success('Password reset successfully');
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAssignRole = async (role) => {
    try {
      await updateRole.mutateAsync({ id: modal.user._id, role });
      toast.success(`Role updated to ${ROLE_LABELS[role]}`);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Failed to load employees</h3>
        <p className="text-sm text-slate-500">There was an error connecting to the server.</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          <RefreshCw size={14} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-up">
      {/* ─── Header ─── */}
      <PageHeader
        title="Employee Management"
        description="Manage employee accounts, roles, branch assignments and employment status."
        actions={
          canAddEmployee && (
            <Button
              variant="primary"
              onClick={() => openModal(MODAL_TYPES.CREATE)}
            >
              <UserPlus size={16} className="mr-2" />
              Add Employee
            </Button>
          )
        }
      />

      {/* ─── Statistics Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Users} label="Total Employees" value={stats.total} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={Calendar} label="On Leave" value={stats.onLeave} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard icon={UserPlus} label="New Hires" value={stats.newHires} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      {/* ─── Filters ─── */}
      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search employee..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full max-w-md"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
            value={filters.roleId}
            onChange={setFilter('roleId')}
            className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
            <option value="">All Roles</option>
            {roles.map((r) => (
            <option key={r._id} value={r._id}>
            {r.name}
            </option>
            ))}
</select>
            <select
              value={filters.status}
              onChange={setFilter('status')}
              className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            {isSuperAdminOrAdmin && (
              <select
                 value={filters.branchId}
                  onChange={setFilter('branchId')}
                  className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                  {b.name}
                  </option>
                  ))}
              </select>
            )}
          </div>
        </div>
      </Card>

      {/* ─── Employee Grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3 mb-5">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <div className="h-9 bg-slate-200 rounded-lg flex-1"></div>
                  <div className="w-[34px] h-[34px] bg-slate-200 rounded-lg shrink-0"></div>
                  <div className="w-[34px] h-[34px] bg-slate-200 rounded-lg shrink-0"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Users size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No employees found</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            We couldn't find any employees matching your current filters or criteria.
          </p>
          {canAddEmployee && (
            <Button variant="primary" onClick={() => openModal(MODAL_TYPES.CREATE)}>
              <UserPlus size={16} className="mr-2" />
              Add Employee
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((user) => {
              const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;
              
              return (
                <Card key={user._id} hover className="flex flex-col h-full group transition-all duration-200">
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Top: Avatar & Badge */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="relative">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.firstName}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-white ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <Badge variant={statusCfg.variant} className="px-2 py-0.5 text-[10px]">
                        {statusCfg.label}
                      </Badge>
                    </div>

                    {/* Middle: Info */}
                    <div className="mb-5">
                      <h3 className="text-[17px] font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{user.employeeId || `EMP-${user._id.slice(-4).toUpperCase()}`}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-blue-600 font-medium">{user.roleId?.name || '—'}</span>
                      </div>
                    </div>

                    {/* Bottom: Details */}
                    <div className="space-y-3 pt-5 border-t border-slate-100 mb-6">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Building2 size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">{user.branchId ? user.branchId.name : 'No Branch'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">{user.phoneNumber || '—'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100">
                      <Button variant="outline" className="flex-1 text-xs font-semibold py-2" onClick={() => openModal(MODAL_TYPES.VIEW, user)}>
                        View Profile
                      </Button>
                      {isSuperAdminOrAdmin && (
                        <button
                          onClick={() => openModal(MODAL_TYPES.EDIT, user)}
                          className="w-[34px] h-[34px] shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      <ActionMenu
                        user={user}
                        onView={() => openModal(MODAL_TYPES.VIEW, user)}
                        onEdit={() => openModal(MODAL_TYPES.EDIT, user)}
                        onDelete={() => openModal(MODAL_TYPES.DELETE, user)}
                        onResetPw={() => openModal(MODAL_TYPES.RESET_PASSWORD, user)}
                        onToggleStatus={() => openModal(MODAL_TYPES.TOGGLE_STATUS, user)}
                        onAssignRole={() => openModal(MODAL_TYPES.ASSIGN_ROLE, user)}
                        hasPermission={isSuperAdminOrAdmin}
                        canChangeRole={isSuperAdminOrAdmin}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ─── Pagination ─── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8 pb-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-sm font-medium transition-colors shadow-sm"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.totalPages)
                  .map((p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1) {
                      return <span key={`ellipsis-${p}`} className="px-2 text-slate-400">...</span>;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-150 ${
                          p === pagination.page
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-sm font-medium transition-colors shadow-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════ MODALS ════════════════════════ */}

      <Modal isOpen={modal.type === MODAL_TYPES.CREATE} onClose={closeModal} title="Create New Employee" size="lg">
      <UserForm 
    onSubmit={handleCreate} 
    onCancel={closeModal} 
    isLoading={createUser.isPending}
    currentUserRole={user?.roleId?.name}
    />
    </Modal>

    <Modal isOpen={modal.type === MODAL_TYPES.EDIT} onClose={closeModal} title="Edit Employee" size="lg">
    <UserForm 
    initialData={modal.user} 
    onSubmit={handleUpdate} 
    onCancel={closeModal} 
    isLoading={updateUser.isPending}
    currentUserRole={user?.roleId?.name}
    />
  </Modal>  
    

      <Modal isOpen={modal.type === MODAL_TYPES.VIEW} onClose={closeModal} title="Employee Details" size="lg">
        <UserDetailView user={modal.user} />
      </Modal>

      <ConfirmDialog
      isOpen={modal.type === MODAL_TYPES.DELETE}
      onClose={closeModal}
      onConfirm={handleDelete}
      type="danger"
      title="Deactivate Employee"
      message={`Are you sure you want to deactivate ${modal.user?.firstName} ${modal.user?.lastName}? They will lose system access but their records will be preserved.`}
      confirmText="Deactivate Employee"
      />

      <ConfirmDialog
        isOpen={modal.type === MODAL_TYPES.TOGGLE_STATUS}
        onClose={closeModal}
        onConfirm={handleToggleStatus}
        type={modal.user?.status === 'ACTIVE' ? 'danger' : 'success'}
        title={modal.user?.status === 'ACTIVE' ? 'Suspend Employee' : 'Activate Employee'}
        message={
          modal.user?.status === 'ACTIVE'
            ? `Suspending ${modal.user?.firstName} ${modal.user?.lastName} will prevent them from logging in.`
            : `Activating ${modal.user?.firstName} ${modal.user?.lastName} will restore their access.`
        }
        confirmText={modal.user?.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
      />

      <Modal isOpen={modal.type === MODAL_TYPES.RESET_PASSWORD} onClose={closeModal} title="Reset Password" size="sm">
        <ResetPasswordForm user={modal.user} onSubmit={handleResetPassword} onCancel={closeModal} isLoading={resetPw.isPending} />
      </Modal>

      <Modal isOpen={modal.type === MODAL_TYPES.ASSIGN_ROLE} onClose={closeModal} title="Assign Role" size="sm">
        <RoleAssignForm user={modal.user} onSubmit={handleAssignRole} onCancel={closeModal} isLoading={updateRole.isPending} />
      </Modal>
    </div>
  );
}
