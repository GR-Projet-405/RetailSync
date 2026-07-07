import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { useSystemEvents, useSystemEventStats } from './hooks/useSystemEvents';
import SummaryStats from './components/SummaryStats';
import EventFilters from './components/EventFilters';
import EventsTable from './components/EventsTable';
import Pagination from './components/Pagination';
import { exportSystemEventsToPDF } from './utils/pdfGenerator';

const DEFAULT_SEVERITIES = ['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'];
const DEFAULT_EVENT_TYPES = [
  'ALL',
  'Database',
  'API',
  'System',
  'Memory',
  'Migration',
  'Lifecycle',
  'Kernel',
  'Network',
  'Security',
];

export default function SystemEventsPage() {
  const [severity, setSeverity] = useState('ALL');
  const [eventType, setEventType] = useState('ALL');
  const [page, setPage] = useState(1);

  const statsQuery = useSystemEventStats();
  const eventsQuery = useSystemEvents({
    severity,
    eventType,
    page,
    limit: 15,
  });

  const events = eventsQuery.data?.events ?? [];
  const pagination = eventsQuery.data?.pagination;
  const severities = eventsQuery.data?.filters.severities ?? DEFAULT_SEVERITIES;
  const eventTypes = eventsQuery.data?.filters.eventTypes ?? DEFAULT_EVENT_TYPES;

  const handleSeverityChange = (value: string) => {
    setSeverity(value);
    setPage(1);
  };

  const handleEventTypeChange = (value: string) => {
    setEventType(value);
    setPage(1);
  };

  const handleRefresh = () => {
    statsQuery.refetch();
    eventsQuery.refetch();
  };

  const handleExport = () => {
    exportSystemEventsToPDF(events, severity, eventType);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Systems Event"
        description="Monitor platform health, service activity, and operational event logs in real time."
        actions={undefined}
      />

      <SummaryStats stats={statsQuery.data} isLoading={statsQuery.isLoading} />

      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Systems Event</h2>
          <p className="text-sm text-slate-500 mt-1">
            Filter and review system-level events across all connected services.
          </p>
        </div>

        <EventFilters
          severity={severity}
          eventType={eventType}
          severities={severities}
          eventTypes={eventTypes}
          onSeverityChange={handleSeverityChange}
          onEventTypeChange={handleEventTypeChange}
          onRefresh={handleRefresh}
          isRefreshing={statsQuery.isFetching || eventsQuery.isFetching}
          onExport={handleExport}
          isExportDisabled={eventsQuery.isLoading || events.length === 0}
        />

        <EventsTable events={events} isLoading={eventsQuery.isLoading} />

        {pagination && pagination.total > 0 && (
          <Pagination pagination={pagination} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
