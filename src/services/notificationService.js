import api from './api';

// Notification API service
export async function getNotifications(params = {}) {
  const res = await api.get('/notifications', { params });
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllRead() {
  const res = await api.patch('/notifications/read-all');
  return res.data;
}

export async function deleteNotification(id) {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
}

export async function getPreferences() {
  const res = await api.get('/notifications/preferences');
  return res.data;
}

export async function updatePreferences(prefs) {
  const res = await api.put('/notifications/preferences', prefs);
  return res.data;
}

export default {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
};
