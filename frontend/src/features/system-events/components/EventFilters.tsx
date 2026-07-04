import { Download, RefreshCw } from 'lucide-react';
import Button from '../../../components/Button';

interface EventFiltersProps {
  severity: string;
  eventType: string;
  severities: string[];
  eventTypes: string[];
  onSeverityChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
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
        <Button variant="outline" size="sm" className="gap-2">
          <Download size={14} />
          Export Logs
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-2.5"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh events"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
      </div>
    </div>
  );
}
