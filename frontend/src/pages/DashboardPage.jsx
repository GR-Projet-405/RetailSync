import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { branchApi } from '../services/branchApi';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/roles';
import PageHeader from '../components/PageHeader';
import { BranchKpiCard } from '../components/branch/BranchKpiCard';
import * as Icons from 'lucide-react';
import Spinner from '../components/Spinner';

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN);

  const { data: comparisonResponse, isLoading } = useQuery({
    queryKey: ['branches', 'comparison'],
    queryFn: () => branchApi.getAdminComparison(),
    enabled: isAdmin,
  });

  const data = comparisonResponse?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and key metrics"
      />

      {isAdmin ? (
        isLoading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Branch Network Comparison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BranchKpiCard 
                title="Total Revenue"
                value={`Rs. ${(data?.totalRevenue / 1000000)?.toFixed(1)}M`}
                trend={{ value: 12.4, label: 'vs last month' }}
                icon={Icons.Banknote}
                variant="primary"
              />
              <BranchKpiCard 
                title="Network Profit"
                value={`Rs. ${(data?.totalRevenue * 0.3 / 1000000)?.toFixed(1)}M`}
                trend={{ value: 8.7, label: 'vs last month' }}
                icon={Icons.TrendingUp}
                variant="success"
              />
              <BranchKpiCard 
                title="Total Orders"
                value="24,830"
                trend={{ value: 5.2, label: 'vs last month' }}
                icon={Icons.ShoppingCart}
                variant="warning"
              />
              <BranchKpiCard 
                title="Growth Rate"
                value="+18.3%"
                trend={{ value: 3.1, label: 'vs last month' }}
                icon={Icons.LineChart}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
               <div className="relative bg-white rounded-xl border border-slate-200 p-6 h-80 flex flex-col justify-center items-center">
                 <h3 className="text-sm font-semibold text-slate-700 absolute top-6 left-6">Revenue By Branch</h3>
                 <Icons.BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
                 <p className="text-slate-500">Revenue Distribution Chart Placeholder</p>
               </div>
               <div className="relative bg-white rounded-xl border border-slate-200 p-6 h-80 flex flex-col justify-center items-center">
                 <h3 className="text-sm font-semibold text-slate-700 absolute top-6 left-6">Profit Distribution</h3>
                 <Icons.PieChart className="w-12 h-12 text-slate-300 mb-4" />
                 <p className="text-slate-500">Profit Donut Chart Placeholder</p>
               </div>
            </div>
          </div>
        )
      ) : (
        <div className="mt-8 p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center text-slate-600">
          <p className="text-sm font-medium">Dashboard components, filters, and records are under active development.</p>
        </div>
      )}
    </div>
  );
}

