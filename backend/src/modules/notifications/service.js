const Notification = require('./model');

const VALID_CATEGORIES = ['orders', 'inventory', 'alerts', 'system', 'activity', 'announcements'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildQuery = ({ search, status, category, priority }) => {
  const query = {};

  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    query.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { message: { $regex: safeSearch, $options: 'i' } },
      { source: { $regex: safeSearch, $options: 'i' } },
      { branchName: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (status === 'unread') query.isRead = false;
  if (status === 'read') query.isRead = true;
  if (category && category !== 'all' && VALID_CATEGORIES.includes(category)) {
    query.category = category;
  }
  if (priority && priority !== 'all' && VALID_PRIORITIES.includes(priority)) {
    query.priority = priority;
  }

  return query;
};

const buildStatsQuery = ({ search, category, priority }) =>
  buildQuery({ search, category, priority });

const pickNotificationPayload = (payload = {}, defaults = {}) => {
  const data = {};

  ['title', 'message', 'branchName', 'source'].forEach((field) => {
    if (payload[field] !== undefined) data[field] = payload[field];
  });

  if (payload.category !== undefined) data.category = payload.category;
  if (payload.priority !== undefined) data.priority = payload.priority;
  if (payload.isRead !== undefined) data.isRead = payload.isRead;
  if (payload.metadata !== undefined) data.metadata = payload.metadata;

  return { ...data, ...defaults };
};

class NotificationsPageService {
  async fetchDetails(filters = {}) {
    const query = buildQuery(filters);
    const statsQuery = buildStatsQuery(filters);

    const [notifications, total, unread, highPriority] = await Promise.all([
      Notification.find(query).sort({ isRead: 1, createdAt: -1 }).lean(),
      Notification.countDocuments(statsQuery),
      Notification.countDocuments({ ...statsQuery, isRead: false }),
      Notification.countDocuments({ ...statsQuery, priority: 'high', isRead: false }),
    ]);

    return {
      notifications,
      stats: {
        total,
        unread,
        highPriority,
      },
    };
  }

  async createNotification(payload = {}, defaults = {}) {
    const notification = await Notification.create(
      pickNotificationPayload(payload, defaults)
    );

    return notification.toObject();
  }

  async updateNotification(id, payload = {}, enforcedQuery = {}) {
    const updates = pickNotificationPayload(payload);

    const notification = await Notification.findOneAndUpdate(
      { _id: id, ...enforcedQuery },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    return notification;
  }

  async fetchAnnouncements(filters = {}) {
    return this.fetchDetails({ ...filters, category: 'announcements' });
  }

  async createAnnouncement(payload = {}) {
    return this.createNotification(payload, {
      category: 'announcements',
      priority: payload.priority || 'medium',
      isRead: payload.isRead ?? false,
      source: payload.source || 'RetailSync',
    });
  }

  async updateAnnouncement(id, payload = {}) {
    const { category, ...announcementPayload } = payload;
    return this.updateNotification(id, announcementPayload, { category: 'announcements' });
  }

  async markAsRead(id) {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    ).lean();

    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    return notification;
  }

  async markAllAsRead() {
    const result = await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    return {
      modifiedCount: result.modifiedCount || 0,
    };
  }

  async deleteNotification(id) {
    const notification = await Notification.findByIdAndDelete(id).lean();

    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    return { deleted: true, id };
  }

  async clearNotifications(filters = {}) {
    const query = buildQuery(filters);
    const result = await Notification.deleteMany(query);

    return {
      deletedCount: result.deletedCount || 0,
    };
  }
}

module.exports = new NotificationsPageService();
