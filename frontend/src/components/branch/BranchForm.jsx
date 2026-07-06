import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { branchApi } from '../../services/branchApi';
import Modal from '../Modal';
import Button from '../Button';
import toast from '../../utils/toast';

export const BranchForm = ({ isOpen, onClose, initialData = null }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      branchName: '',
      branchCode: '',
      address: {
        line1: '',
        city: '',
        district: '',
        postalCode: '',
      },
      phone: '',
      email: '',
      openingDate: '',
      status: 'ACTIVE'
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Format date for input[type="date"]
        let formattedDate = '';
        if (initialData.openingDate) {
          formattedDate = new Date(initialData.openingDate).toISOString().split('T')[0];
        }
        reset({
          ...initialData,
          openingDate: formattedDate
        });
      } else {
        reset({
          branchName: '',
          branchCode: '',
          address: { line1: '', city: '', district: '', postalCode: '' },
          phone: '',
          email: '',
          openingDate: '',
          status: 'ACTIVE'
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditMode ? branchApi.updateBranch(initialData._id, data) : branchApi.createBranch(data),
    onSuccess: (res) => {
      toast.success(res.message || `Branch ${isEditMode ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['branch', initialData._id] });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Branch' : 'Create New Branch'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Branch Info */}
          <div className="space-y-6">
            <h3 className="flex items-center text-sm font-semibold text-slate-800 gap-2 pb-2 border-b">
              <Icons.FileText className="w-4 h-4 text-blue-500" />
              Branch Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Colombo Central"
                  {...register('branchName', { required: 'Branch name is required' })}
                />
                {errors.branchName && <p className="text-red-500 text-xs mt-1">{errors.branchName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" 
                  placeholder="e.g. BR001"
                  {...register('branchCode', { required: 'Branch code is required' })}
                />
                {errors.branchCode && <p className="text-red-500 text-xs mt-1">{errors.branchCode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opening Date *</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  {...register('openingDate', { required: 'Opening date is required' })}
                />
                {errors.openingDate && <p className="text-red-500 text-xs mt-1">{errors.openingDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="+94 77 XXX XXXX"
                  {...register('phone', { required: 'Phone number is required' })}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="manager@retailsync.lk"
                  {...register('email')}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Location */}
          <div className="space-y-6">
            <h3 className="flex items-center text-sm font-semibold text-slate-800 gap-2 pb-2 border-b">
              <Icons.MapPin className="w-4 h-4 text-blue-500" />
              Location Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="No. 42, Galle Road"
                  {...register('address.line1', { required: 'Street address is required' })}
                />
                {errors.address?.line1 && <p className="text-red-500 text-xs mt-1">{errors.address.line1.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Colombo"
                    {...register('address.city', { required: 'City is required' })}
                  />
                  {errors.address?.city && <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Province *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Western"
                    {...register('address.district', { required: 'Province is required' })}
                  />
                  {errors.address?.district && <p className="text-red-500 text-xs mt-1">{errors.address.district.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. 00300"
                    {...register('address.postalCode')}
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t">
                <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                  <div>
                    <label className="font-medium text-slate-800">Branch Active</label>
                    <p className="text-xs text-slate-500">Mark this branch as operational and visible</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" {...register('status')} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditMode ? 'Update Branch' : 'Save Branch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
