import { useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, PackageX } from 'lucide-react';

import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { SearchInput } from '../components/SearchInput';
import { Button } from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { cn } from '../utils/cn';

import ProductFormModal from '../components/ProductFormModal';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useCategories } from '../hooks/useCategories';
import {useSuppliers}from '../hooks/useSuppliers';
// import{useWarehouses}from '../hooks/useWarehouses';
import {
  useProductsList,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useProducts';

const STATUS_BADGE = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  DRAFT: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
};

const STOCK_BADGE = (stock) => {
  if (stock === 0) return 'bg-red-50 text-red-600';
  return 'bg-emerald-50 text-emerald-700';
};

/** Small debounce so we don't fire a request on every keystroke in the search box */
function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export default function ProductPage() {
  // ---- Categories for filter dropdown + Add/Edit form ----
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: suppliers = [] } = useSuppliers({ status: 'ACTIVE' });
  // const {data:warehouses = []} = useWarehouses();

  // ---- Filters / pagination state (Product List + Product Search combined) ----
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  const debouncedSearch = useDebouncedValue(searchTerm);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status]);

  const { data, isLoading, isFetching } = useProductsList({
    page,
    limit,
    category: category || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const products = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  // ---- Modal state ----
  const [formModal, setFormModal] = useState({ open: false, product: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, productId: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: detailsProduct } = useProduct(detailsModal.productId);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openAddModal = () => setFormModal({ open: true, product: null });
  const openEditModal = (product) => {
    setDetailsModal({ open: false, productId: null });
    setFormModal({ open: true, product });
  };
  const openDetailsModal = (product) => setDetailsModal({ open: true, productId: product._id });

  const handleFormSubmit = (payload) => {
    if (formModal.product) {
      updateMutation.mutate(
        { id: formModal.product._id, payload },
        { onSuccess: () => setFormModal({ open: false, product: null }) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setFormModal({ open: false, product: null }),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setDetailsModal({ open: false, productId: null });
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Product',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              {row.images?.[0]?.url ? (
                <img src={row.images[0].url} alt={row.name} className="w-full h-full object-cover" />
              ) : (
                <PackageX className="w-4 h-4 text-slate-300" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-500">
                {row.brand ? `${row.brand} · ` : ''}
                {row.category?.name || 'Uncategorized'}
              </p>
            </div>
          </div>
        ),
      },
      { key: 'sku', header: 'SKU' },
      {
        key: 'category',
        header: 'Category',
        render: (row) => row.category?.name || '—',
      },
      {
        key: 'price',
        header: 'Price',
        render: (row) => `$${(row.pricing?.sellingPrice ?? 0).toFixed(2)}`,
      },
      {
        key: 'stock',
        header: 'Stock',
        render: (row) => {
          const stock = row.totalStock ?? 0;
          return (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', STOCK_BADGE(stock))}>
              {stock === 0 ? 'Out of Stock' : `${stock} units`}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_BADGE[row.status])}>
            {row.status}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openDetailsModal(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="View details"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit product"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete product"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalogue, pricing, and stock across branches."
        actions={
          <Button variant="primary" onClick={openAddModal}>
            <Plus size={16} className="mr-1.5" />
            Add Product
          </Button>
        }
      />

      {!categoriesLoading && categories.length === 0 && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          No categories found. Create at least one category in{' '}
          <span className="font-semibold">Category Management</span> before adding products.
        </div>
      )}

      {/* Filters (Product List + Product Search combined) */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name, brand, or tag..."
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <p className="text-sm text-slate-500 mb-3">
        Showing {products.length} of {pagination.total} products
      </p>

      <DataTable
        columns={columns}
        data={products}
        emptyMessage={isLoading ? 'Loading products...' : 'No products found. Try adjusting your filters.'}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="secondary"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} className="mr-1" />
            Prev
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            disabled={page >= pagination.totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          >
            Next
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      )}

      {/* Add / Edit modal */}
      <ProductFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, product: null })}
        onSubmit={handleFormSubmit}
        isSubmitting={isSaving}
        product={formModal.product}
        categories={categories}
        suppliers={suppliers}
        //warehouses = {warehouses}
      />

      {/* Details modal */}
      <ProductDetailsModal
        isOpen={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, productId: null })}
        product={detailsProduct}
        onEdit={openEditModal}
        onDelete={(product) => setDeleteTarget(product)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this product?"
        message={`"${deleteTarget?.name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
