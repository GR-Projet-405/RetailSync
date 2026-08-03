import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as aiReorderingService from '../services/aiReorderingService';
import { toast } from '../utils/toast';

const AI_REORDERING_KEY = 'aiReordering';

export const useAIReorderingDetails = () =>
  useQuery({
    queryKey: [AI_REORDERING_KEY, 'details'],
    queryFn: () => aiReorderingService.getDetails(),
  });

export const useAIRecommendations = (params = {}) =>
  useQuery({
    queryKey: [AI_REORDERING_KEY, 'recommendations', params],
    queryFn: () => aiReorderingService.getRecommendations(params),
    keepPreviousData: true,
  });

export const useGenerateAIRecommendations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => aiReorderingService.generateRecommendations(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AI_REORDERING_KEY] });
      toast.success(data.message || 'AI recommendations generated successfully.');
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || 'Failed to generate recommendations.'),
  });
};

export const useUpdateAIRecommendationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, decisionNote }) =>
      aiReorderingService.updateRecommendationStatus(id, { status, decisionNote }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [AI_REORDERING_KEY] });
      toast.success(`Recommendation ${variables.status.toLowerCase()} successfully.`);
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || 'Failed to update recommendation status.'),
  });
};

export const useConvertToPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      aiReorderingService.convertToPurchaseOrder(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AI_REORDERING_KEY] });
      // Invalidate purchase orders queries too if they are registered
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success(data.message || 'Successfully converted to Purchase Order draft.');
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || 'Failed to convert to purchase order.'),
  });
};
