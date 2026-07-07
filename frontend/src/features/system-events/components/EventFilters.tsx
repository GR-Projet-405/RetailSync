import { Download, RefreshCw } from 'lucide-react';
import { cn } from '../../../utils/cn';

const outlineButtonClass =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs';

interface EventFiltersProps {
  severity: string;
  eventType: string;
  severities: string[];
  eventTypes: string[];
  onSeverityChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: () => void;
  isExportDisabled?: boolean;
}

function formatFilterLabel(value: string) {
  if (value === 'ALL') return 'All Levels';
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatEventTypeLabel(value: string) {
  if (value === 'ALL') return 'All Types';
  return value;
}

export default function EventFilters({
  severity,
  eventType,
  severities,
  eventTypes,
  onSeverityChange,
  onEventTypeChange,
  onRefresh,
  isRefreshing,
  onExport,
  isExportDisabled,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Severity:
          </span>
          <select
            value={severity}
            onChange={(event) => onSeverityChange(event.target.value)}
            className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {severities.map((item) => (
              <option key={item} value={item}>
                {formatFilterLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Event Type:
          </span>
          <select
            value={eventType}
            onChange={(event) => onEventTypeChange(event.target.value)}
            className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {eventTypes.map((item) => (
              <option key={item} value={item}>
                {formatEventTypeLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(outlineButtonClass, 'gap-2')}
          onClick={onExport}
          disabled={isExportDisabled}
        >
          <Download size={14} />
          Export Logs
        </button>
        <button
          type="button"
          className={cn(outlineButtonClass, 'px-2.5')}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh events"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
