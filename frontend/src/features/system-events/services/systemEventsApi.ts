import api from '../../../services/api';
import type { ApiResponse, EventQueryParams, EventsResponse, SystemEventStats } from '../types';

export async function fetchSystemEventStats(): Promise<SystemEventStats> {
  const response = await api.get<ApiResponse<SystemEventStats>>('/system-events/stats');
  return response.data.data;
}

export async function fetchSystemEvents(params: EventQueryParams = {}): Promise<EventsResponse> {
  const response = await api.get<ApiResponse<EventsResponse>>('/system-events/events', {
    params,
  });
  return response.data.data;
}
