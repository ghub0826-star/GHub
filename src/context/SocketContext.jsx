import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinRoom,
  leaveRoom,
  emitTyping,
  emitStopTyping,
  emitMarkRead,
  SOCKET_EVENTS,
} from '../services/socketService';
import { getUnreadCount } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState({}); // conversationId -> [messages]
  const [typingUsers, setTypingUsers] = useState({}); // conversationId -> { [userId]: true }

  // Handler registrations registry (so hooks can subscribe to socket events)
  const listenersRef = useRef(new Map()); // event -> Set<callback>

  const on = useCallback((event, cb) => {
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event).add(cb);
    return () => {
      const set = listenersRef.current.get(event);
      if (set) {
        set.delete(cb);
        if (set.size === 0) listenersRef.current.delete(event);
      }
    };
  }, []);

  const emitLocal = useCallback((event, data) => {
    const set = listenersRef.current.get(event);
    if (set) {
      set.forEach((cb) => {
        try { cb(data); } catch (e) { /* ignore */ }
      });
    }
  }, []);

  // Connect socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    const socket = connectSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      // Re-join personal/seller room
      joinRoom(`user:${user?.id}`);
      if (user?.role === 'SELLER') joinRoom(`seller:${user?.id}`);
      if (['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) joinRoom('admin');
      // Refresh unread count on reconnect
      getUnreadCount().then((r) => {
        if (r && typeof r.count !== 'undefined') setUnreadCount(r.count);
      }).catch(() => {});
    };

    const onDisconnect = () => setIsConnected(false);

    const onNotificationNew = (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 100));
      setUnreadCount((c) => c + 1);
      emitLocal(SOCKET_EVENTS.NOTIFICATION_NEW, payload);
    };

    const onNotificationCount = (payload) => {
      if (payload && typeof payload.count !== 'undefined') {
        setUnreadCount(payload.count);
        emitLocal(SOCKET_EVENTS.NOTIFICATION_COUNT, payload);
      }
    };

    const onNotificationRead = (payload) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === payload?.id ? { ...n, isRead: true } : n))
      );
      emitLocal(SOCKET_EVENTS.NOTIFICATION_READ, payload);
    };

    const onChatNew = (payload) => {
      const { message, conversationId } = payload || {};
      if (!message || !conversationId) return;
      setChatMessages((prev) => {
        const list = prev[conversationId] || [];
        return { ...prev, [conversationId]: [...list, message] };
      });
      emitLocal(SOCKET_EVENTS.CHAT_NEW, payload);
    };

    const onChatTyping = (payload) => {
      const { from, conversationId } = payload || {};
      if (!from || !conversationId) return;
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: { ...(prev[conversationId] || {}), [from]: true },
      }));
    };

    const onChatStopTyping = (payload) => {
      const { from, conversationId } = payload || {};
      if (!from || !conversationId) return;
      setTypingUsers((prev) => {
        const conv = { ...(prev[conversationId] || {}) };
        delete conv[from];
        return { ...prev, [conversationId]: conv };
      });
    };

    const onForceLogout = async (payload) => {
      await logout();
      navigate('/login');
    };

    const onMaintenance = (payload) => {
      // Could show a banner; for now just emit
      emitLocal(SOCKET_EVENTS.SYSTEM_MAINTENANCE, payload);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNotificationNew);
    socket.on(SOCKET_EVENTS.NOTIFICATION_COUNT, onNotificationCount);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, onNotificationRead);
    socket.on(SOCKET_EVENTS.CHAT_NEW, onChatNew);
    socket.on(SOCKET_EVENTS.CHAT_TYPING, onChatTyping);
    socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, onChatStopTyping);
    socket.on(SOCKET_EVENTS.USER_FORCE_LOGOUT, onForceLogout);
    socket.on(SOCKET_EVENTS.SYSTEM_MAINTENANCE, onMaintenance);

    // Initial load
    getUnreadCount().then((r) => {
      if (r && typeof r.count !== 'undefined') setUnreadCount(r.count);
    }).catch(() => {});

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNotificationNew);
      socket.off(SOCKET_EVENTS.NOTIFICATION_COUNT, onNotificationCount);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, onNotificationRead);
      socket.off(SOCKET_EVENTS.CHAT_NEW, onChatNew);
      socket.off(SOCKET_EVENTS.CHAT_TYPING, onChatTyping);
      socket.off(SOCKET_EVENTS.CHAT_STOP_TYPING, onChatStopTyping);
      socket.off(SOCKET_EVENTS.USER_FORCE_LOGOUT, onForceLogout);
      socket.off(SOCKET_EVENTS.SYSTEM_MAINTENANCE, onMaintenance);
      disconnectSocket();
      setIsConnected(false);
    };
  }, [isAuthenticated, user, navigate, logout, emitLocal]);

  const value = useMemo(() => ({
    socket: socketRef.current,
    isConnected,
    notifications,
    unreadCount,
    setUnreadCount,
    chatMessages,
    setChatMessages,
    typingUsers,
    joinRoom,
    leaveRoom,
    emitTyping,
    emitStopTyping,
    emitMarkRead,
    on,
    SOCKET_EVENTS,
  }), [
    isConnected,
    notifications,
    unreadCount,
    chatMessages,
    typingUsers,
    on,
    emitLocal,
  ]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  return useContext(SocketContext);
}
