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
  const baseTime = new Date().getTime();
  const events = [];

  BASE_EVENTS.forEach((evt, idx) => {
    // Offset each event by 5 minutes to spread them out
    const offset = idx * 5 * 60 * 1000;
    events.push({
      ...evt,
      timestamp: new Date(baseTime - offset).toISOString(),
    });
  });

  const remainingCount = 30 - BASE_EVENTS.length;
  for (let i = 1; i <= remainingCount; i += 1) {
    const severity = SEVERITIES[i % SEVERITIES.length];
    const eventType = EVENT_TYPES[i % EVENT_TYPES.length];
    const source = SOURCES[i % SOURCES.length];
    const action = ACTIONS[i % ACTIONS.length];
    const message = MESSAGES[i % MESSAGES.length];
    
    // Spread generated events by 10 minutes, starting after base events
    const offset = (BASE_EVENTS.length + i) * 10 * 60 * 1000;
    const timestamp = new Date(baseTime - offset).toISOString();

    events.push({
      eventId: padEventId(2000 + i),
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

class SystemEventsService {
  getStats() {
    const ALL_EVENTS = generateDummyEvents();

    // 1. Active Services: Unique sources present in events vs total sources defined
    const activeSources = new Set(ALL_EVENTS.map((event) => event.source));
    const active = activeSources.size;
    const total = SOURCES.length;

    // 2. Log Volume (1H): Number of events in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastHourCount = ALL_EVENTS.filter((e) => new Date(e.timestamp) >= oneHourAgo).length;
    
    // Trend compared to previous hour (1H to 2H ago)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const prevHourCount = ALL_EVENTS.filter((e) => {
      const t = new Date(e.timestamp);
      return t >= twoHoursAgo && t < oneHourAgo;
    }).length;
    
    const diff = lastHourCount - prevHourCount;
    const trend = prevHourCount === 0 ? (lastHourCount > 0 ? 100 : 0) : Math.round((diff / prevHourCount) * 100);
    const trendDirection = trend >= 0 ? 'up' : 'down';

    // 3. Unresolved Errors: Count of unresolved events
    const unresolvedErrors = ALL_EVENTS.filter((e) => !e.resolved).length;

    // 4. DB Latency: Pseudo-latency based on DB unresolved events
    const dbEvents = ALL_EVENTS.filter((e) => e.eventType === 'Database');
    const unresolvedDbEvents = dbEvents.filter((e) => !e.resolved);
    let dbLatencyValue = '14ms';
    let dbLatencyStatus = 'Optimized';

    if (unresolvedDbEvents.some((e) => e.severity === 'CRITICAL')) {
      dbLatencyValue = '245ms';
      dbLatencyStatus = 'Degraded';
    } else if (unresolvedDbEvents.some((e) => e.severity === 'ERROR')) {
      dbLatencyValue = '120ms';
      dbLatencyStatus = 'Warning';
    } else if (unresolvedDbEvents.some((e) => e.severity === 'WARNING')) {
      dbLatencyValue = '65ms';
      dbLatencyStatus = 'Warning';
    }

    return {
      activeServices: { active, total },
      logVolume: { count: String(lastHourCount), trend: Math.abs(trend), trendDirection },
      unresolvedErrors,
      dbLatency: { value: dbLatencyValue, status: dbLatencyStatus },
    };
  }

  getEvents({ severity, eventType, page = 1, limit = 15 } = {}) {
    const ALL_EVENTS = generateDummyEvents();
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
