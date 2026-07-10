import Modal from './Modal';
import { Button } from './Button';
import { cn } from '../utils/cn';
import { Pencil, Trash2, PackageX } from 'lucide-react';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  DRAFT: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
};

const formatCurrency = (value) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '—';

export default function ProductDetailsModal({ isOpen, onClose, product, onEdit, onDelete }) {
  if (!product) return null;

  const { pricing = {}, inventory = {}, variants = [], supplier, category } = product;
  const totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: images + quick info */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <PackageX className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Info</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">SKU</dt>
                <dd className="font-medium text-slate-900">{product.sku}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Barcode</dt>
                <dd className="font-medium text-slate-900">{product.barcode || '—'}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_STYLES[product.status])}>
                    {product.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Added</dt>
                <dd className="font-medium text-slate-900">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right column: description, sizes/stock, pricing, supplier, tags */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">
              {product.brand ? `${product.brand} · ` : ''}
              {category?.name || 'Uncategorized'}
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(pricing.sellingPrice)}</p>
            <p className="text-sm text-slate-600 mt-2">{product.description}</p>
          </div>

          {variants.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Sizes & Stock</h4>
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{v.size}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-semibold',
                        v.quantity === 0
                          ? 'bg-red-50 text-red-600'
                          : v.quantity <= (inventory.reorderPoint || 0)
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {v.quantity === 0 ? 'Out of stock' : `${v.quantity} units`}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-semibold text-slate-900">
                  <span>Total Stock</span>
                  <span>{totalStock} units</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Pricing Details</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Selling Price</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(pricing.sellingPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Cost Price</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(pricing.costPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Margin</dt>
                <dd className="font-medium text-emerald-600">{product.margin ?? 0}%</dd>
              </div>
            </dl>
          </div>

          {supplier && (
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Supplier</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Supplier</dt>
                  <dd className="font-medium text-blue-600">{supplier.name}</dd>
                </div>
                {product.leadTimeDays && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Lead Time</dt>
                    <dd className="font-medium text-slate-900">{product.leadTimeDays}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Reorder Point</dt>
                  <dd className="font-medium text-slate-900">{inventory.reorderPoint || 0} units</dd>
                </div>
              </dl>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
        <Button variant="danger" onClick={() => onDelete(product)}>
          <Trash2 size={14} className="mr-1.5" />
          Delete
        </Button>
        <Button variant="primary" onClick={() => onEdit(product)}>
          <Pencil size={14} className="mr-1.5" />
          Edit
        </Button>
      </div>
    </Modal>
  );
}
