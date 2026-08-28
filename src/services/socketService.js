import { io } from 'socket.io-client';

const ACCESS_KEY = 'ghub_access_token';

// Socket event names (must match backend/shared/socketEvents.js)
export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_COUNT: 'notification:count',
  ORDER_UPDATED: 'order:updated',
  PAYMENT_UPDATED: 'payment:updated',
  DELIVERY_UPDATED: 'delivery:updated',
  DISPUTE_UPDATED: 'dispute:updated',
  CHAT_NEW: 'chat:new',
  CHAT_TYPING: 'chat:typing',
  CHAT_STOP_TYPING: 'chat:stop-typing',
  CHAT_READ: 'chat:read',
  USER_FORCE_LOGOUT: 'user:force-logout',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  MARK_READ: 'mark-read',
};

// Socket URL: must be set via REACT_APP_SOCKET_URL in production.
// Falls back to localhost only in local development.
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL
  || (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : '')
  || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');

let socket = null;

// Create (or reuse) a socket connection authenticated with the access token.
export function connectSocket() {
  if (socket) return socket;

  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) return null;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Join a room (e.g. `order:GH123`, `dispute:5`, `user:1`)
export function joinRoom(room) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, room);
}

export function leaveRoom(room) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.LEAVE_ROOM, room);
}

// Chat helpers
export function emitTyping(room) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.TYPING, { room });
}

export function emitStopTyping(room) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.STOP_TYPING, { room });
}

export function emitMarkRead(room) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.MARK_READ, { room });
}

export default {
  connectSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  emitTyping,
  emitStopTyping,
  emitMarkRead,
  SOCKET_EVENTS,
};
