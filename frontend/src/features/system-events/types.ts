export type EventSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

export interface SystemEvent {
  eventId: string;
  timestamp: string;
  severity: EventSeverity;
  eventType: string;
  source: string;
  message: string;
  subtitle: string | null;
  action: string;
  resolved: boolean;
}

export interface EventPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
}

export interface EventFiltersMeta {
  severities: string[];
  eventTypes: string[];
}

export interface EventsResponse {
  events: SystemEvent[];
  pagination: EventPagination;
  filters: EventFiltersMeta;
}

export interface ActiveServicesStat {
  active: number;
  total: number;
}

export interface LogVolumeStat {
  count: string;
  trend: number;
  trendDirection: 'up' | 'down';
}

export interface DbLatencyStat {
  value: string;
  status: string;
}

export interface SystemEventStats {
  activeServices: ActiveServicesStat;
  logVolume: LogVolumeStat;
  unresolvedErrors: number;
  dbLatency: DbLatencyStat;
}

export interface EventQueryParams {
  severity?: string;
  eventType?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}
