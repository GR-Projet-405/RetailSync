import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal';
import { Button } from './Button';
import { cn } from '../utils/cn';

// NOTE: assumes Button.jsx exposes a `variant` prop ('primary' | 'secondary' | 'danger' | 'ghost')
// and Modal.jsx exposes `size` ('sm'|'md'|'lg'|'xl') per the component you already have.
// Adjust prop names below if your Button/Card implementations differ.

const TAX_CLASSES = [
  { value: 'STANDARD_15', label: 'Standard (15%)' },
  { value: 'ZERO', label: 'Zero-rated' },
  { value: 'EXEMPT', label: 'Exempt' },
];

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'INACTIVE'];
const VISIBILITY_OPTIONS = ['VISIBLE', 'HIDDEN'];

const emptyForm = {
  name: '',
  description: '',
  category: '',
  brand: '',
  sku: '',
  barcode: '',
  sellingPrice: '',
  costPrice: '',
  compareAtPrice: '',
  taxClass: 'STANDARD_15',
  trackInventory: true,
  reorderPoint: 0,
  initialQuantity: 0,
  warehouse: '',
  supplier: '',
  leadTimeDays: '',
  status: 'DRAFT',
  visibility: 'VISIBLE',
  featured: false,
  tags: [],
};

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(payload: object) => void} props.onSubmit
 * @param {boolean} props.isSubmitting
 * @param {object|null} props.product - pass an existing product to edit, omit/null to add
 * @param {Array<{_id:string,name:string}>} [props.categories]
 * @param {Array<{_id:string,name:string}>} [props.suppliers]
 * @param {Array<{_id:string,name:string}>} [props.warehouses]
 */
export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  product = null,
  categories = [],
  suppliers = [],
  warehouses = [],
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(emptyForm);
  const [tagDraft, setTagDraft] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        brand: product.brand || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        sellingPrice: product.pricing?.sellingPrice ?? '',
        costPrice: product.pricing?.costPrice ?? '',
        compareAtPrice: product.pricing?.compareAtPrice ?? '',
        taxClass: product.pricing?.taxClass || 'STANDARD_15',
        trackInventory: product.inventory?.trackInventory ?? true,
        reorderPoint: product.inventory?.reorderPoint ?? 0,
        initialQuantity: 0,
        warehouse: product.inventory?.warehouse?._id || product.inventory?.warehouse || '',
        supplier: product.supplier?._id || product.supplier || '',
        leadTimeDays: product.leadTimeDays || '',
        status: product.status || 'DRAFT',
        visibility: product.visibility || 'VISIBLE',
        featured: product.featured || false,
        tags: product.tags || [],
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setTagDraft('');
  }, [isOpen, product]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addTag = () => {
    const value = tagDraft.trim().toLowerCase();
    if (value && !form.tags.includes(value)) {
      setField('tags', [...form.tags, value]);
    }
    setTagDraft('');
  };

  const removeTag = (tag) => {
    setField('tags', form.tags.filter((t) => t !== tag));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Product name is required.';
    if (!form.category) next.category = 'Category is required.';
    if (form.sellingPrice === '' || Number(form.sellingPrice) < 0) {
      next.sellingPrice = 'Selling price is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      brand: form.brand.trim(),
      barcode: form.barcode.trim() || null,
      pricing: {
        sellingPrice: Number(form.sellingPrice),
        costPrice: Number(form.costPrice) || 0,
        compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice),
        taxClass: form.taxClass,
      },
      inventory: {
        trackInventory: form.trackInventory,
        reorderPoint: Number(form.reorderPoint) || 0,
        // warehouse: form.warehouse || undefined,
      },
      supplier: form.supplier || undefined,
      leadTimeDays: form.leadTimeDays.trim(),
      status: form.status,
      visibility: form.visibility,
      featured: form.featured,
      tags: form.tags,
    };

    if (!isEdit) {
      payload.sku = form.sku.trim() || undefined; // blank -> backend auto-generates
      payload.initialQuantity = Number(form.initialQuantity) || 0;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Product · ${product?.sku || ''}` : 'Add New Product'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Basic Information</h4>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Running Shoe X200"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors',
                errors.name ? 'border-red-400' : 'border-slate-300 focus:border-blue-500'
              )}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Lightweight performance running shoe with responsive cushioning..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-slate-400 text-right">{form.description.length}/500</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-white outline-none',
                  errors.category ? 'border-red-400' : 'border-slate-300 focus:border-blue-500'
                )}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setField('brand', e.target.value)}
                placeholder="Select or type a brand"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                disabled={isEdit}
                onChange={(e) => setField('sku', e.target.value)}
                placeholder="e.g. RSX-200-BLK"
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border outline-none',
                  isEdit ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-300 focus:border-blue-500'
                )}
              />
              <p className="text-xs text-slate-400 mt-1">
                {isEdit ? 'SKU cannot be changed after creation.' : 'Auto-generated if left blank.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Barcode / UPC</label>
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => setField('barcode', e.target.value)}
                placeholder="Enter barcode"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900">Pricing</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) => setField('sellingPrice', e.target.value)}
                  placeholder="0.00"
                  className={cn(
                    'w-full pl-7 pr-3 py-2 text-sm rounded-lg border outline-none',
                    errors.sellingPrice ? 'border-red-400' : 'border-slate-300 focus:border-blue-500'
                  )}
                />
              </div>
              {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cost Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => setField('costPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Compare-at Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => setField('compareAtPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tax Class</label>
              <select
                value={form.taxClass}
                onChange={(e) => setField('taxClass', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 bg-white outline-none"
              >
                {TAX_CLASSES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.sellingPrice && Number(form.sellingPrice) > 0 && (
            <div className="rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-2">
              Current Margin:{' '}
              {(((Number(form.sellingPrice) - Number(form.costPrice || 0)) / Number(form.sellingPrice)) * 100).toFixed(1)}%
              {' · '}You earn ${(Number(form.sellingPrice) - Number(form.costPrice || 0)).toFixed(2)} per unit sold
            </div>
          )}
        </section>

        {/* Inventory */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900">Inventory</h4>
          <div className="grid grid-cols-3 gap-4">
            {!isEdit && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.initialQuantity}
                  onChange={(e) => setField('initialQuantity', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reorder Point</label>
              <input
                type="number"
                min="0"
                value={form.reorderPoint}
                onChange={(e) => setField('reorderPoint', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>
            {/* <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Warehouse</label>
              <select
                value={form.warehouse}
                onChange={(e) => setField('warehouse', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 bg-white outline-none"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div> */}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.trackInventory}
              onChange={(e) => setField('trackInventory', e.target.checked)}
              className="rounded border-slate-300"
            />
            Track inventory for this product
          </label>
        </section>

        {/* Supplier */}
        <section className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
            <select
              value={form.supplier}
              onChange={(e) => setField('supplier', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 bg-white outline-none"
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Lead Time</label>
            <input
              type="text"
              value={form.leadTimeDays}
              onChange={(e) => setField('leadTimeDays', e.target.value)}
              placeholder="e.g. 7-10 days"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
            />
          </div>
        </section>

        {/* Publish Settings */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900">Publish Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 bg-white outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Visibility</label>
              <select
                value={form.visibility}
                onChange={(e) => setField('visibility', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 bg-white outline-none"
              >
                {VISIBILITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setField('featured', e.target.checked)}
              className="rounded border-slate-300"
            />
            Featured product
          </label>
        </section>

        {/* Tags */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-medium text-slate-600">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tags... press Enter"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
          />
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
