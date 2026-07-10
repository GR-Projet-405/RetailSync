import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { branchApi } from '../../services/branchApi';
import PageHeader from '../../components/PageHeader';
import { BranchKpiCard } from '../../components/branch/BranchKpiCard';
import Spinner from '../../components/Spinner';

const BranchDashboard = () => {
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['branch', 'my-dashboard'],
    queryFn: () => branchApi.getMyDashboard(),
    retry: false
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center mt-6">
        <Icons.AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-rose-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-rose-600">{error?.message || 'You might not be assigned to a branch.'}</p>
      </div>
    );
  }

  const data = response?.data;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Branch Dashboard" 
        subtitle="Overview of your branch performance and operations."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BranchKpiCard 
          title="Today's Sales"
          value={`Rs. ${data?.todaySales?.toLocaleString()}`}
          subtext="Revenue generated today"
          icon={Icons.Banknote}
          variant="success"
        />
        <BranchKpiCard 
          title="Monthly Sales"
          value={`Rs. ${(data?.monthlySales / 1000000)?.toFixed(2)}M`}
          trend={{ value: 8.5, label: 'vs last month' }}
          icon={Icons.TrendingUp}
          variant="primary"
        />
        <BranchKpiCard 
          title="Low Stock Alerts"
          value={data?.lowStockItemsCount}
          subtext="Items below minimum threshold"
          icon={Icons.AlertOctagon}
          variant="warning"
        />
        <BranchKpiCard 
          title="Active Staff"
          value={data?.staffCount}
          subtext="Employees currently assigned"
          icon={Icons.Users}
        />
      </div>

      {/* Placeholders for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex flex-col justify-center items-center">
          <Icons.BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500">Sales Trend Chart Placeholder</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex flex-col justify-center items-center">
           <Icons.PieChart className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-slate-500">Top Selling Products Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;
