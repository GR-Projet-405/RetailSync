import api from './api';

const BASE = '/notifications';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'],
  list: (filters) => ['notifications', 'list', filters],
};

export const getNotifications = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data;
};

export const getAnnouncements = async (params = {}) => {
  const { data } = await api.get(`${BASE}/announcements`, { params });
  return data;
};

export const updateAnnouncement = async ({ id, payload }) => {
  const { data } = await api.patch(`${BASE}/announcements/${id}`, payload);
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`${BASE}/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.patch(`${BASE}/read-all`);
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};

export const clearNotifications = async (params = {}) => {
  const { data } = await api.delete(BASE, { params });
  return data;
};
