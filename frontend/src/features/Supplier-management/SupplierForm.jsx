import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useSuppliers';

const inputClass =
  'w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all duration-150 placeholder:text-slate-400';

const emptyForm = { name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' };

export default function SupplierForm({ supplier, onDone }) {
  const isEditing = Boolean(supplier);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const isSaving = createSupplier.isPending || updateSupplier.isPending;

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [supplier]);

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Supplier name is required 🙏');
      return;
    }

    try {
      if (isEditing) {
        await updateSupplier.mutateAsync({ id: supplier._id, data: form });
      } else {
        await createSupplier.mutateAsync(form);
      }
      onDone?.();
    } catch (err) {
      setError(err.message || 'Something went wrong saving this supplier 😕');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">⚠️ {error}</div>
      )}

      <Field label="Supplier Name *">
        <input
          className={inputClass}
          placeholder="Sunshine Traders"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact Person">
          <input
            className={inputClass}
            placeholder="Saman Perera"
            value={form.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputClass}
            placeholder="+94 77 123 4567"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Email">
        <input
          type="email"
          className={inputClass}
          placeholder="supplier@example.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </Field>

      <Field label="Address">
        <input
          className={inputClass}
          placeholder="123 Main Street, Colombo"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
        />
      </Field>

      <Field label="Notes">
        <textarea
          className={`${inputClass} min-h-[70px]`}
          placeholder="Optional internal notes…"
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => onDone?.()} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving… ⏳' : isEditing ? 'Save Changes' : 'Add Supplier'}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
