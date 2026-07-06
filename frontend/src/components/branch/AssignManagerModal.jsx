import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { branchApi } from '../../services/branchApi';
import { getUsers } from '../../services/userService';
import Modal from '../Modal';
import Button from '../Button';
import Spinner from '../Spinner';
import toast from '../../utils/toast';

export const AssignManagerModal = ({ isOpen, onClose, branchId, currentManagerId, branchName }) => {
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const queryClient = useQueryClient();

  // Fetch users with BRANCH_MANAGER role
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', 'managers'],
    queryFn: () => getUsers({ role: 'BRANCH_MANAGER', limit: 100 }),
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (managerId) => branchApi.assignManager(branchId, managerId),
    onSuccess: () => {
      toast.success('Manager assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', branchId] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign manager');
    },
  });

  const handleAssign = () => {
    if (!selectedManagerId) return;
    assignMutation.mutate(selectedManagerId);
  };

  const managers = usersData?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Manager to ${branchName}`}>
      <div className="p-6">
        <p className="text-sm text-slate-500 mb-4">
          Select a Branch Manager from the list below. If the selected manager is already assigned to another branch, they will be reassigned to this one.
        </p>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Select Manager</label>
            <div className="relative">
              <select
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
              >
                <option value="" disabled>-- Select a Manager --</option>
                {managers.map(manager => (
                  <option 
                    key={manager._id} 
                    value={manager._id} 
                    disabled={manager._id === currentManagerId}
                  >
                    {manager.firstName} {manager.lastName} {manager._id === currentManagerId ? '(Current)' : ''}
                  </option>
                ))}
              </select>
              <Icons.User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <Icons.ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {selectedManagerId && selectedManagerId !== currentManagerId && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <Icons.AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  Are you sure? This action will immediately update the branch's leadership and record an audit log.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onClose} disabled={assignMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedManagerId || selectedManagerId === currentManagerId || assignMutation.isPending}
            isLoading={assignMutation.isPending}
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
};
