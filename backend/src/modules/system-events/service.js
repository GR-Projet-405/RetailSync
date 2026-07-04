const SEVERITIES = ['CRITICAL', 'ERROR', 'WARNING', 'INFO'];
const EVENT_TYPES = [
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
const SOURCES = [
  'Core.DB_Cluster',
  'API.Gateway',
  'Sys.Memory',
  'System.Lifecycle',
  'DB.Migration',
  'System.Kernel',
  'Auth.Service',
  'Cache.Redis',
  'Queue.Worker',
];
const ACTIONS = ['View Stack', 'Retry', 'Scale Up', 'Log Summary', 'Diff', 'Report'];

const BASE_EVENTS = [
  {
    eventId: 'EVT-9921',
    timestamp: '2023-10-24T14:02:11.000Z',
    severity: 'CRITICAL',
    eventType: 'Database',
    source: 'Core.DB_Cluster',
    message: 'Primary DB Instance (US-EAST-1) disconnected unexpectedly.',
    subtitle: 'Auto-failover initiated...',
    action: 'View Stack',
    resolved: false,
  },
  {
    eventId: 'EVT-8840',
    timestamp: '2023-10-24T13:58:45.000Z',
    severity: 'ERROR',
    eventType: 'API',
    source: 'API.Gateway',
    message: 'Failed to process payment callback for order #RE-4410.',
    subtitle: 'Error code: 502 Bad Gateway',
    action: 'Retry',
    resolved: false,
  },
  {
    eventId: 'EVT-7721',
    timestamp: '2023-10-24T13:45:00.000Z',
    severity: 'WARNING',
    eventType: 'Memory',
    source: 'Sys.Memory',
    message: 'Worker-Node-04 memory usage exceeding 85% threshold.',
    subtitle: null,
    action: 'Scale Up',
    resolved: false,
  },
  {
    eventId: 'EVT-6610',
    timestamp: '2023-10-24T13:30:12.000Z',
    severity: 'INFO',
    eventType: 'Lifecycle',
    source: 'System.Lifecycle',
    message: "Background sync completed successfully for 'Regional Inventory'.",
    subtitle: 'Processed 1.2M records...',
    action: 'Log Summary',
    resolved: true,
  },
  {
    eventId: 'EVT-5510',
    timestamp: '2023-10-24T13:25:00.000Z',
    severity: 'INFO',
    eventType: 'Migration',
    source: 'DB.Migration',
    message: "Database migration 'add_audit_indices' applied to Production.",
    subtitle: null,
    action: 'Diff',
    resolved: true,
  },
  {
    eventId: 'EVT-1002',
    timestamp: '2023-10-24T13:00:01.000Z',
    severity: 'INFO',
    eventType: 'Kernel',
    source: 'System.Kernel',
    message: 'Scheduled platform health-check completed.',
    subtitle: null,
    action: 'Report',
    resolved: true,
  },
];

const MESSAGES = [
  'Connection pool saturation detected on read replica.',
  'Rate limit threshold reached for external webhook endpoint.',
  'SSL certificate renewal completed successfully.',
  'Scheduled backup job finished with zero errors.',
  'Cache invalidation broadcast sent to all edge nodes.',
  'User session cleanup task completed.',
  'Inventory sync queue lag exceeded warning threshold.',
  'Payment gateway latency spike detected.',
  'Audit log rotation completed for partition 2023-Q4.',
  'Branch replication lag normalized after failover.',
];

function padEventId(index) {
  return `EVT-${String(index).padStart(4, '0')}`;
}

function generateDummyEvents() {
  const events = [...BASE_EVENTS];
  const baseTime = new Date('2023-10-24T12:59:00.000Z').getTime();

  for (let i = 7; i <= 2442; i += 1) {
    const severity = SEVERITIES[i % SEVERITIES.length];
    const eventType = EVENT_TYPES[i % EVENT_TYPES.length];
    const source = SOURCES[i % SOURCES.length];
    const action = ACTIONS[i % ACTIONS.length];
    const message = MESSAGES[i % MESSAGES.length];
    const timestamp = new Date(baseTime - i * 45000).toISOString();

    events.push({
      eventId: padEventId(1000 + i),
      timestamp,
      severity,
      eventType,
      source,
      message,
      subtitle: i % 3 === 0 ? 'Additional diagnostic context available.' : null,
      action,
      resolved: severity === 'INFO' || severity === 'WARNING',
    });
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

const ALL_EVENTS = generateDummyEvents();

class SystemEventsService {
  getStats() {
    return {
      activeServices: { active: 24, total: 24 },
      logVolume: { count: '12.4k', trend: 4, trendDirection: 'up' },
      unresolvedErrors: 3,
      dbLatency: { value: '14ms', status: 'Optimized' },
    };
  }

  getEvents({ severity, eventType, page = 1, limit = 50 } = {}) {
    let filtered = [...ALL_EVENTS];

    if (severity && severity !== 'ALL') {
      filtered = filtered.filter((event) => event.severity === severity);
    }

    if (eventType && eventType !== 'ALL') {
      filtered = filtered.filter((event) => event.eventType === eventType);
    }

    const total = filtered.length;
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
    const currentPage = Math.min(safePage, totalPages);
    const start = (currentPage - 1) * safeLimit;
    const events = filtered.slice(start, start + safeLimit);

    return {
      events,
      pagination: {
        page: currentPage,
        limit: safeLimit,
        total,
        totalPages,
        from: total === 0 ? 0 : start + 1,
        to: Math.min(start + safeLimit, total),
      },
      filters: {
        severities: ['ALL', ...SEVERITIES],
        eventTypes: ['ALL', ...EVENT_TYPES],
      },
    };
  }

  async fetchDetails() {
    return {
      module: 'System Events',
      status: 'Active',
    };
  }
}

module.exports = new SystemEventsService();
