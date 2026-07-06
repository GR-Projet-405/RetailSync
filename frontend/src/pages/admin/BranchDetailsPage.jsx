import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { branchApi } from '../../services/branchApi';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { BranchStatusBadge } from '../../components/branch/BranchStatusBadge';
import { BranchKpiCard } from '../../components/branch/BranchKpiCard';
import { RecentActivityTimeline } from '../../components/branch/RecentActivityTimeline';
import DataTable from '../../components/DataTable';

const BranchDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: response, isLoading } = useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchApi.getBranchById(id),
  });

  const { data: dashboardResponse } = useQuery({
    queryKey: ['branch', id, 'dashboard'],
    queryFn: () => branchApi.getBranchDashboard(id),
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['branch', id, 'employees'],
    queryFn: () => branchApi.getBranchEmployees(id),
  });

  const { data: auditLogsResponse } = useQuery({
    queryKey: ['branch', id, 'audit-logs'],
    queryFn: () => branchApi.getBranchAuditLogs(id),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center"><Spinner size="lg" /></div>;
  }

  const branch = response?.data;
  if (!branch) {
    return <div>Branch not found.</div>;
  }

  const kpis = dashboardResponse?.data || {};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Icons.LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Icons.Users },
    { id: 'inventory', label: 'Inventory', icon: Icons.Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <PageHeader 
            title="Branch Details" 
            breadcrumbs={[{ label: 'Management', path: '#' }, { label: 'Branches', path: '/admin/branches' }, { label: 'Branch Details' }]}
          />
        </div>
        <Button 
          variant="outline" 
          icon={Icons.ArrowLeft}
          onClick={() => navigate('/admin/branches')}
        >
          Back To List
        </Button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">{branch.branchName}</h1>
            <BranchStatusBadge status={branch.status} />
          </div>
          <p className="text-sm text-slate-500">{branch.address?.district}</p>
        </div>
        <Button variant="outline" icon={Icons.Edit}>Edit</Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Branch ID</span>
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <Icons.Building2 className="w-4 h-4 text-slate-400" />
            {branch.branchCode}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Branch Manager</span>
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <Icons.User className="w-4 h-4 text-slate-400" />
            {branch.managerId ? `${branch.managerId.firstName} ${branch.managerId.lastName}` : 'Unassigned'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Contact Number</span>
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <Icons.Phone className="w-4 h-4 text-slate-400" />
            {branch.phone}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:col-span-1">
          <span className="text-xs text-slate-500 mb-1">Email Address</span>
          <div className="flex items-center gap-2 text-slate-800 font-medium truncate">
            <Icons.Mail className="w-4 h-4 text-slate-400" />
            {branch.email || 'N/A'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:col-span-2">
          <span className="text-xs text-slate-500 mb-1">Address</span>
          <div className="flex items-center gap-2 text-slate-800 font-medium truncate">
            <Icons.MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{branch.formattedAddress}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <BranchKpiCard 
          title="Monthly Revenue"
          value={`Rs. ${(kpis.monthlySales / 1000000).toFixed(1)}M`}
          icon={Icons.Coins}
          variant="primary"
        />
        <BranchKpiCard 
          title="Total Employees"
          value={kpis.staffCount?.toString()}
          icon={Icons.Users}
          variant="success"
        />
        <BranchKpiCard 
          title="Total Orders"
          value="9,840"
          icon={Icons.ShoppingCart}
          variant="warning"
        />
        <BranchKpiCard 
          title="Inventory Items"
          value="240"
          icon={Icons.Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tabs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
          <div className="flex border-b border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-6 flex-1">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Branch Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm text-slate-500">Branch ID</span>
                      <span className="text-sm font-medium text-slate-800">{branch.branchCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm text-slate-500">Region</span>
                      <span className="text-sm font-medium text-slate-800">{branch.address?.district}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm text-slate-500">Opening Date</span>
                      <span className="text-sm font-medium text-slate-800">
                        {new Date(branch.openingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Performance Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm text-slate-500">Monthly Revenue</span>
                      <span className="text-sm font-medium text-slate-800">Rs. {(kpis.monthlySales / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm text-slate-500">Growth Rate</span>
                      <span className="text-sm font-medium text-emerald-600">+12.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                <DataTable 
                  columns={[
                    { header: 'Name', accessorKey: 'firstName', cell: (_, row) => `${row.firstName} ${row.lastName}` },
                    { header: 'Role', accessorKey: 'roleId', cell: (val) => val?.name?.replace('_', ' ') },
                    { header: 'Status', accessorKey: 'status', cell: (val) => <BranchStatusBadge status={val} /> },
                  ]}
                  data={employeesResponse?.data || []}
                  pagination={{ currentPage: 1, totalPages: 1 }}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <div className="text-center text-slate-500 py-8">
                  Inventory details will load here from the Inventory module.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Activity */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
            <p className="text-sm text-slate-500 mt-1">Latest events at this branch</p>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
             <RecentActivityTimeline activities={auditLogsResponse?.data} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default BranchDetailsPage;
