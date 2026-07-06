import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { branchApi } from '../../services/branchApi';
import Modal from '../Modal';
import Button from '../Button';
import toast from '../../utils/toast';

export const BranchForm = ({ isOpen, onClose, initialData = null }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        let formattedDate = '';
        if (initialData.openingDate) {
          formattedDate = new Date(initialData.openingDate).toISOString().split('T')[0];
        }
        setFormData({
          ...initialData,
          openingDate: formattedDate
        });
      } else {
        setFormData({
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
  }, [isOpen, initialData]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // basic validation
    const newErrors = {};
    if (!formData.branchName) newErrors.branchName = 'Branch name is required';
    if (!formData.branchCode) newErrors.branchCode = 'Branch code is required';
    if (!formData.openingDate) newErrors.openingDate = 'Opening date is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address.line1) newErrors['address.line1'] = 'Street address is required';
    if (!formData.address.city) newErrors['address.city'] = 'City is required';
    if (!formData.address.district) newErrors['address.district'] = 'Province is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 'ACTIVE' : 'INACTIVE') : value
      }));
    }
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
                  name="branchName"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Colombo Central"
                  value={formData.branchName || ''}
                  onChange={handleChange}
                />
                {errors.branchName && <p className="text-red-500 text-xs mt-1">{errors.branchName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code *</label>
                <input 
                  type="text" 
                  name="branchCode"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" 
                  placeholder="e.g. BR001"
                  value={formData.branchCode || ''}
                  onChange={handleChange}
                />
                {errors.branchCode && <p className="text-red-500 text-xs mt-1">{errors.branchCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opening Date *</label>
                <input 
                  type="date" 
                  name="openingDate"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  value={formData.openingDate || ''}
                  onChange={handleChange}
                />
                {errors.openingDate && <p className="text-red-500 text-xs mt-1">{errors.openingDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input 
                  type="text" 
                  name="phone"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="+94 77 XXX XXXX"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="manager@retailsync.lk"
                  value={formData.email || ''}
                  onChange={handleChange}
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
                  name="address.line1"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="No. 42, Galle Road"
                  value={formData.address.line1 || ''}
                  onChange={handleChange}
                />
                {errors['address.line1'] && <p className="text-red-500 text-xs mt-1">{errors['address.line1']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                  <input 
                    type="text" 
                    name="address.city"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Colombo"
                    value={formData.address.city || ''}
                    onChange={handleChange}
                  />
                  {errors['address.city'] && <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Province *</label>
                  <input 
                    type="text" 
                    name="address.district"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Western"
                    value={formData.address.district || ''}
                    onChange={handleChange}
                  />
                  {errors['address.district'] && <p className="text-red-500 text-xs mt-1">{errors['address.district']}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    name="address.postalCode"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. 00300"
                    value={formData.address.postalCode || ''}
                    onChange={handleChange}
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
                    <input 
                      type="checkbox" 
                      name="status"
                      className="sr-only peer" 
                      checked={formData.status === 'ACTIVE'}
                      onChange={handleChange} 
                    />
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
