import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../services/productService';
import { toast } from '../utils/toast';

const PRODUCTS_KEY = 'products';

export const useProductsList = (params) =>
  useQuery({
    queryKey: [PRODUCTS_KEY, 'list', params],
    queryFn: () => productService.list(params),
    keepPreviousData: true,
  });

export const useProductSearch = (params, enabled = true) =>
  useQuery({
    queryKey: [PRODUCTS_KEY, 'search', params],
    queryFn: () => productService.search(params),
    enabled,
    keepPreviousData: true,
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: [PRODUCTS_KEY, 'detail', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Product created successfully.');
    },
    onError: (error) => toast.error(error.message || 'Failed to create product.'),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, 'detail', variables.id] });
      toast.success('Product updated successfully.');
    },
    onError: (error) => toast.error(error.message || 'Failed to update product.'),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Product deleted successfully.');
    },
    onError: (error) => {
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message;

      if (status === 409) {
        // BR-INV-005: product is referenced by sales/purchase orders
        toast.error(
          backendMessage ||
          'This product cannot be deleted because it is linked to existing sales or purchase orders.'
        );
      } else if (status === 404) {
        toast.error(backendMessage || 'Product not found. It may have already been deleted.');
      } else {
        toast.error(backendMessage || 'Failed to delete product.');
      }
    },
  });
};

// export const useDeleteProduct = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id) => productService.remove(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
//       toast.success('Product deleted successfully.');
//     },
//     onError: (error) => toast.error(error.message || 'Failed to delete product.'),
//   });
// };
