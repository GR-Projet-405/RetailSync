import React, { useState, useMemo } from 'react';
import { Shield, Plus, Pencil, Trash2, Eye, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import RoleForm from './RoleForm';
import { ROLE_LABELS, ROLE_COLORS } from '../../config/roles';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../../hooks/useRoles';

// Inline Toast Utility (copied from UserListPage)
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
const toast = { success: (m) => _showToast(m,'success'), error: (m) => _showToast(m,'error') };

const MODAL_TYPES = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
};

export default function RoleListPage() {
  const { data, isLoading } = useRoles();
  const roles = data?.data || [];

  const [modal, setModal] = useState({ type: null, role: null });

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const openModal = (type, role = null) => setModal({ type, role });
  const closeModal = () => setModal({ type: null, role: null });

  const handleCreate = async (payload) => {
    try {
      payload.name = payload.name.toUpperCase().replace(/\s+/g, '_');
      await createRole.mutateAsync(payload);
      toast.success('Role created successfully');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateRole.mutateAsync({ id: modal.role._id, data: payload });
      toast.success('Role updated successfully');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRole.mutateAsync(modal.role._id);
      toast.success('Role deleted successfully');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Role Name',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.isSystemRole ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
            {row.isSystemRole ? <ShieldCheck size={16} /> : <Shield size={16} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{ROLE_LABELS[row.name] || row.name}</p>
            {row.isSystemRole && <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">System Role</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-sm text-slate-600 truncate max-w-[250px] block">
          {row.description || <span className="italic text-slate-400">No description provided.</span>}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[300px]">
          {row.permissions.slice(0, 3).map(p => (
            <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium truncate max-w-[100px]">
              {p.replace(/_/g, ' ')}
            </span>
          ))}
          {row.permissions.length > 3 && (
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-bold">
              +{row.permissions.length - 3} more
            </span>
          )}
          {row.permissions.length === 0 && (
            <span className="text-xs text-slate-400 italic">No permissions</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openModal(MODAL_TYPES.VIEW, row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openModal(MODAL_TYPES.EDIT, row)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
            title="Edit Role"
          >
            <Pencil size={16} />
          </button>
          {!row.isSystemRole && (
            <button
              onClick={() => openModal(MODAL_TYPES.DELETE, row)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Role"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Role Management</h2>
          <p className="text-sm text-slate-500 mt-1">Configure roles and access permissions for your staff.</p>
        </div>
        <Button onClick={() => openModal(MODAL_TYPES.CREATE)} size="sm">
          <Plus size={16} />
          Create Custom Role
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <DataTable
            columns={columns}
            data={roles}
            emptyMessage="No roles found."
          />
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal.type === MODAL_TYPES.CREATE}
        onClose={closeModal}
        title="Create Custom Role"
      >
        <RoleForm
          onSubmit={handleCreate}
          onCancel={closeModal}
          isLoading={createRole.isPending}
        />
      </Modal>

      <Modal
        isOpen={modal.type === MODAL_TYPES.EDIT}
        onClose={closeModal}
        title="Edit Role"
      >
        <RoleForm
          initialData={modal.role}
          onSubmit={handleUpdate}
          onCancel={closeModal}
          isLoading={updateRole.isPending}
        />
      </Modal>

      <Modal
        isOpen={modal.type === MODAL_TYPES.VIEW}
        onClose={closeModal}
        title="Role Details"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Role Name</h3>
            <p className="text-sm text-slate-600 mt-1">{modal.role?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            <p className="text-sm text-slate-600 mt-1">{modal.role?.description || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Permissions</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {modal.role?.permissions?.map(p => (
                <Badge key={p} variant="neutral">{p.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={closeModal} variant="outline">Close</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={modal.type === MODAL_TYPES.DELETE}
        onClose={closeModal}
        onConfirm={handleDelete}
        title="Delete Custom Role"
        message={`Are you sure you want to delete the role ${modal.role?.name}? This cannot be undone.`}
        confirmText="Delete Role"
        type="danger"
        isLoading={deleteRole.isPending}
      />
    </div>
  );
}
