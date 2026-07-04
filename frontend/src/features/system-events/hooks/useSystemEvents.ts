import { useQuery } from '@tanstack/react-query';
import { fetchSystemEvents, fetchSystemEventStats } from '../services/systemEventsApi';
import type { EventQueryParams } from '../types';

export function useSystemEventStats() {
  return useQuery({
    queryKey: ['system-events', 'stats'],
    queryFn: fetchSystemEventStats,
  });
}

export function useSystemEvents(params: EventQueryParams) {
  return useQuery({
    queryKey: ['system-events', 'list', params],
    queryFn: () => fetchSystemEvents(params),
  });
}
