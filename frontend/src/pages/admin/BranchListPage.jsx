import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { branchApi } from '../../services/branchApi';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import SearchInput from '../../components/SearchInput';
import { BranchKpiCard } from '../../components/branch/BranchKpiCard';
import { BranchStatusBadge } from '../../components/branch/BranchStatusBadge';
import { BranchForm } from '../../components/branch/BranchForm';
import { AssignManagerModal } from '../../components/branch/AssignManagerModal';
import toast from '../../utils/toast';

const BranchListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branches', { page, limit: 10, search: searchTerm, status: statusFilter }],
    queryFn: () => branchApi.getBranches({ page, limit: 10, search: searchTerm, status: statusFilter }),
    keepPreviousData: true,
  });

  const branches = branchData?.data || [];
  const pagination = branchData?.pagination || { page: 1, totalPages: 1, total: 0 };

  const { data: comparisonData } = useQuery({
    queryKey: ['branches', 'comparison'],
    queryFn: () => branchApi.getAdminComparison(),
  });

  const columns = [
    {
      header: 'Branch ID',
      accessorKey: 'branchCode',
      cell: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      header: 'Branch Name',
      accessorKey: 'branchName',
      cell: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{value}</span>
          <span className="text-xs text-slate-500">{row.address?.district}</span>
        </div>
      )
    },
    {
      header: 'Branch Manager',
      accessorKey: 'managerId',
      cell: (value) => value ? `${value.firstName} ${value.lastName}` : <span className="text-slate-400 italic">Unassigned</span>,
    },
    {
      header: 'City',
      accessorKey: 'address',
      cell: (value) => value?.city || '-',
    },
    {
      header: 'Employees',
      accessorKey: 'totalStaff',
      cell: (value) => value || 0,
    },
    {
      header: 'Monthly Revenue',
      accessorKey: 'todaySales',
      cell: (value) => `Rs. ${(value * 30 / 1000000).toFixed(1)}M`, // Mocking monthly based on today
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (value) => <BranchStatusBadge status={value} />,
    },
  ];

  const handleAction = (action, branch) => {
    if (action === 'view') {
      navigate(`/admin/branches/${branch._id}`);
    } else if (action === 'edit') {
      setSelectedBranch(branch);
      setIsFormOpen(true);
    } else if (action === 'assign') {
      setSelectedBranch(branch);
      setIsAssignModalOpen(true);
    }
  };

  const actions = [
    {
      label: 'View Details',
      icon: Icons.Eye,
      onClick: (row) => handleAction('view', row),
    },
    {
      label: 'Edit Branch',
      icon: Icons.Edit,
      onClick: (row) => handleAction('edit', row),
    },
    {
      label: 'Assign Manager',
      icon: Icons.UserPlus,
      onClick: (row) => handleAction('assign', row),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <PageHeader 
            title="Branch List" 
            subtitle="View and manage all branch details from one place."
          />
        </div>
        <Button 
          icon={Icons.Plus} 
          onClick={() => {
            setSelectedBranch(null);
            setIsFormOpen(true);
          }}
        >
          Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BranchKpiCard 
          title="Total Branches"
          value={comparisonData?.totalBranches?.toString().padStart(2, '0') || '00'}
          subtext="Total Branches"
          icon={Icons.Building2}
          variant="primary"
        />
        <BranchKpiCard 
          title="Active Branches"
          value={comparisonData?.activeBranches?.toString().padStart(2, '0') || '00'}
          subtext="Active Branches"
          icon={Icons.CheckSquare}
          variant="success"
        />
        <BranchKpiCard 
          title="Inactive Branches"
          value={((comparisonData?.totalBranches || 0) - (comparisonData?.activeBranches || 0)).toString().padStart(2, '0')}
          subtext="Inactive Branches"
          icon={Icons.XSquare}
          variant="warning"
        />
        <BranchKpiCard 
          title="Total Employees"
          value={branches.reduce((acc, b) => acc + (b.totalStaff || 0), 0) || '0'}
          subtext="Total Employees"
          icon={Icons.Users}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-96 relative">
            <SearchInput 
              placeholder="Branch ID, Branch Name, City ..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPage(1);
              }}
            >
              Clear
            </Button>
            <Button>Search</Button>
          </div>
        </div>

        <DataTable 
          columns={columns}
          data={branches}
          isLoading={isLoading}
          actions={actions}
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: setPage
          }}
          emptyMessage="No branches found matching your criteria."
        />
      </div>

      <BranchForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedBranch}
      />

      {isAssignModalOpen && selectedBranch && (
        <AssignManagerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          branchId={selectedBranch._id}
          currentManagerId={selectedBranch.managerId?._id}
          branchName={selectedBranch.branchName}
        />
      )}
    </div>
  );
};

export default BranchListPage;
