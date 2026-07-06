import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateReceipt } from '../../hooks/useGoodsReceiving';

// Matches the focus/border styling used in SearchInput.jsx for visual consistency
const inputClass =
  'w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all duration-150 placeholder:text-slate-400';

const emptyItem = () => ({
  key: crypto.randomUUID(),
  productName: '',
  sku: '',
  orderedQty: '',
  receivedQty: '',
  condition: 'GOOD',
});

export default function GoodsReceiptForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createReceipt = useCreateReceipt();

  const [form, setForm] = useState({
    supplier: '',
    poNumber: '',
    deliveryDate: '',
    destinationWarehouse: '',
    notes: '',
  });
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateItem = (key, field, value) =>
    setItems((rows) => rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  const addItem = () => setItems((rows) => [...rows, emptyItem()]);
  const removeItem = (key) => setItems((rows) => rows.filter((row) => row.key !== key));

  const handleSubmit = async (saveAsDraft) => {
    setError('');

    if (!form.poNumber || !form.deliveryDate || !form.destinationWarehouse) {
      setError('Please fill in Purchase Order #, Delivery Date, and Destination Warehouse 🙏');
      return;
    }
    if (items.some((i) => !i.productName || !i.sku)) {
      setError('Every item needs a product name and SKU 📦');
      return;
    }

    const payload = {
      supplier: form.supplier,
      poNumber: form.poNumber,
      deliveryDate: form.deliveryDate,
      destinationWarehouse: form.destinationWarehouse,
      notes: form.notes,
      saveAsDraft,
      items: items.map((row) => ({
        productName: row.productName,
        sku: row.sku,
        orderedQty: Number(row.orderedQty) || 0,
        receivedQty: Number(row.receivedQty) || 0,
        condition: row.condition,
      })),
    };

    try {
      const receipt = await createReceipt.mutateAsync(payload);
      navigate(`/goods-receiving/verify/${receipt._id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong saving this receipt 😕');
    }
  };

  return (
    <>
      <PageHeader
        title="Goods Receipt Form"
        description="Record incoming shipment details and verify quantities against the purchase order 📋"
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">⚠️ {error}</div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supplier &amp; Purchase Order</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Supplier">
            <input
              className={inputClass}
              placeholder="Supplier name…"
              value={form.supplier}
              onChange={(e) => updateField('supplier', e.target.value)}
            />
          </Field>
          <Field label="Purchase Order #">
            <input
              className={inputClass}
              placeholder="PO-4421"
              value={form.poNumber}
              onChange={(e) => updateField('poNumber', e.target.value)}
            />
          </Field>
          <Field label="Delivery Date">
            <input
              type="date"
              className={inputClass}
              value={form.deliveryDate}
              onChange={(e) => updateField('deliveryDate', e.target.value)}
            />
          </Field>
          <Field label="Received By">
            <input
              className={`${inputClass} bg-slate-50`}
              value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
              disabled
            />
          </Field>
          <Field label="Destination Warehouse">
            <input
              className={inputClass}
              placeholder="Main Warehouse – Level 2"
              value={form.destinationWarehouse}
              onChange={(e) => updateField('destinationWarehouse', e.target.value)}
            />
          </Field>
          <Field label="Notes">
            <input
              className={inputClass}
              placeholder="Optional delivery notes…"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Ordered</th>
                  <th className="pb-2 font-medium">Received</th>
                  <th className="pb-2 font-medium">Condition</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100">
                    <td className="py-2 pr-2">
                      <input
                        className={inputClass}
                        placeholder="Milo 400g Tin"
                        value={row.productName}
                        onChange={(e) => updateItem(row.key, 'productName', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className={inputClass}
                        placeholder="ML-400-T"
                        value={row.sku}
                        onChange={(e) => updateItem(row.key, 'sku', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2 w-24">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={row.orderedQty}
                        onChange={(e) => updateItem(row.key, 'orderedQty', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2 w-24">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={row.receivedQty}
                        onChange={(e) => updateItem(row.key, 'receivedQty', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2 w-32">
                      <select
                        className={inputClass}
                        value={row.condition}
                        onChange={(e) => updateItem(row.key, 'condition', e.target.value)}
                      >
                        <option value="GOOD">Good</option>
                        <option value="DAMAGED">Damaged</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(row.key)}
                        className="text-red-600 text-xs hover:underline disabled:opacity-40 disabled:no-underline"
                        disabled={items.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addItem} className="mt-3 text-blue-600 text-sm hover:underline">
            + Add item
          </button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={createReceipt.isPending}>
          Save as Draft
        </Button>
        <Button variant="primary" onClick={() => handleSubmit(false)} disabled={createReceipt.isPending}>
          {createReceipt.isPending ? 'Submitting… ⏳' : 'Submit Receipt'}
        </Button>
      </div>
    </>
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
