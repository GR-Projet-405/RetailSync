import { Activity, AlertTriangle, Database, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/Card';
import Spinner from '../../../components/Spinner';
import type { SystemEventStats } from '../types';

interface SummaryStatsProps {
  stats?: SystemEventStats;
  isLoading: boolean;
}

function StatCard({
  label,
  children,
  footer,
}: {
  label: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-3">
        {label}
      </p>
      {children}
      {footer}
    </Card>
  );
}

export default function SummaryStats({ stats, isLoading }: SummaryStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!stats) return null;

  const servicePercent = Math.round(
    (stats.activeServices.active / stats.activeServices.total) * 100
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Active Services">
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-bold text-slate-900">
            {stats.activeServices.active}/{stats.activeServices.total}
          </p>
          <Activity size={18} className="text-blue-500 shrink-0" />
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${servicePercent}%` }}
          />
        </div>
      </StatCard>

      <StatCard label="Log Volume (1H)">
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-bold text-slate-900">{stats.logVolume.count}</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp size={14} />
            {stats.logVolume.trend}%
          </span>
        </div>
      </StatCard>

      <StatCard label="Unresolved Errors">
        <p className="text-2xl font-bold text-red-600">{stats.unresolvedErrors}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertTriangle size={13} />
          Requires Action
        </p>
      </StatCard>

      <StatCard label="DB Latency">
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-bold text-slate-900">{stats.dbLatency.value}</p>
          <Database size={18} className="text-slate-400 shrink-0" />
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">{stats.dbLatency.status}</p>
      </StatCard>
    </div>
  );
}
