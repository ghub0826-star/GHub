import { useCallback, useEffect, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';
import * as notificationService from '../services/notificationService';

// Hook for notifications: realtime list + unread count + CRUD actions.
export function useNotifications() {
  const { notifications, unreadCount, setUnreadCount, SOCKET_EVENTS } = useSocketContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]); // loaded from API (full) — realtime prepends to this

  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications(params);
      const items = res && res.notifications ? res.notifications : [];
      setList(items);
      return items;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal memuat notifikasi');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res && typeof res.count !== 'undefined') setUnreadCount(res.count);
    } catch (e) { /* ignore */ }
  }, [setUnreadCount]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      refreshUnread();
    } catch (e) { /* ignore */ }
  }, [refreshUnread]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setList((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) { /* ignore */ }
  }, [setUnreadCount]);

  const remove = useCallback(async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setList((prev) => prev.filter((n) => n.id !== id));
      refreshUnread();
    } catch (e) { /* ignore */ }
  }, [refreshUnread]);

  // Merge realtime notifications into the list (dedupe by id)
  useEffect(() => {
    if (notifications && notifications.length) {
      setList((prev) => {
        const ids = new Set(prev.map((n) => n.id));
        const fresh = notifications.filter((n) => !ids.has(n.id));
        return [...fresh, ...prev];
      });
    }
  }, [notifications]);

  return {
    notifications: list,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    refreshUnread,
    markRead,
    markAllRead,
    remove,
    SOCKET_EVENTS,
  };
}

export default useNotifications;
