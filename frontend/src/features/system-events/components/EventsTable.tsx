import { cn } from '../../../utils/cn';
import Spinner from '../../../components/Spinner';
import SeverityBadge from './SeverityBadge';
import type { EventSeverity, SystemEvent } from '../types';

interface EventsTableProps {
  events: SystemEvent[];
  isLoading: boolean;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getMessageColor(severity: EventSeverity) {
  if (severity === 'CRITICAL') return 'text-red-700';
  if (severity === 'ERROR') return 'text-red-600';
  return 'text-slate-800';
}

export default function EventsTable({ events, isLoading }: EventsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 border border-slate-200 rounded-xl bg-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[960px] text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <th className="px-5 py-3.5">Timestamp</th>
            <th className="px-5 py-3.5">Severity</th>
            <th className="px-5 py-3.5">Event ID</th>
            <th className="px-5 py-3.5">Source</th>
            <th className="px-5 py-3.5">Message</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {events.length > 0 ? (
            events.map((event) => (
              <tr key={event.eventId} className="hover:bg-blue-50/40 transition-colors duration-150">
                <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                  {formatTimestamp(event.timestamp)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <SeverityBadge severity={event.severity} />
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-slate-700">
                  {event.eventId}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-slate-600 text-xs">
                  {event.source}
                </td>
                <td className="px-5 py-4">
                  <p className={cn('font-semibold text-sm', getMessageColor(event.severity))}>
                    {event.message}
                  </p>
                  {event.subtitle && (
                    <p className="mt-1 text-xs text-slate-500">{event.subtitle}</p>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {event.action}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-5 py-14 text-center text-slate-400">
                No system events found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
