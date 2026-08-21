import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import SearchInput from '../../components/SearchInput';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import SupplierForm from './SupplierForm';
import { useSuppliers, useDeactivateSupplier } from '../../hooks/useSuppliers';

export default function SupplierListPage() {
  const [search, setSearch] = useState('');
  const { data: suppliers, isLoading, isError } = useSuppliers({ search });
  const deactivateSupplier = useDeactivateSupplier();

  const [modalState, setModalState] = useState(null); // null | { mode: 'add' } | { mode: 'edit', supplier }
  const [confirmDeactivate, setConfirmDeactivate] = useState(null); // supplier being deactivated

  const closeModal = () => setModalState(null);

  const columns = [
    { key: 'name', header: 'Supplier' },
    { key: 'contactPerson', header: 'Contact Person', render: (row) => row.contactPerson || '—' },
    { key: 'email', header: 'Email', render: (row) => row.email || '—' },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => setModalState({ mode: 'edit', supplier: row })}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Edit
          </button>
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => setConfirmDeactivate(row)}
              className="text-red-600 hover:underline text-sm font-medium"
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Supplier Management"
        description="Manage the suppliers your branches order goods from 🚚"
        actions={<Button onClick={() => setModalState({ mode: 'add' })}>+ Add Supplier</Button>}
      />

      <div className="mb-4">
        <SearchInput placeholder="Search suppliers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-red-600">😕 Couldn't load suppliers. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={isLoading ? [] : suppliers}
          emptyMessage={isLoading ? 'Loading suppliers… ⏳' : 'No suppliers yet — add your first one! 🚚'}
        />
      )}

      <Modal
        isOpen={!!modalState}
        onClose={closeModal}
        title={modalState?.mode === 'edit' ? 'Edit Supplier' : 'Add Supplier'}
      >
        {modalState && <SupplierForm supplier={modalState.supplier} onDone={closeModal} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => deactivateSupplier.mutate(confirmDeactivate._id)}
        title="Deactivate this supplier?"
        message={`"${confirmDeactivate?.name}" won't appear in the Goods Receipt Form's supplier list anymore. Existing receipts linked to them are unaffected.`}
        confirmText="Yes, Deactivate"
        type="danger"
      />
    </>
  );
}
