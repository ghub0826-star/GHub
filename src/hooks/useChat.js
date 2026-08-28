import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';
import * as chatService from '../services/chatService';

// Hook for chat: manages a conversation's messages, realtime updates, typing, read receipts.
export function useChat(conversationId, orderNumber) {
  const {
    chatMessages,
    setChatMessages,
    typingUsers,
    joinRoom,
    leaveRoom,
    emitTyping,
    emitStopTyping,
    emitMarkRead,
    isConnected,
  } = useSocketContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const typingTimer = useRef(null);

  // Sync from context store for this conversation
  useEffect(() => {
    if (conversationId && chatMessages && chatMessages[conversationId]) {
      setMessages(chatMessages[conversationId]);
    }
  }, [conversationId, chatMessages]);

  // Join the order room for realtime updates
  useEffect(() => {
    if (orderNumber && isConnected) {
      joinRoom(`order:${orderNumber}`);
      return () => leaveRoom(`order:${orderNumber}`);
    }
  }, [orderNumber, isConnected, joinRoom, leaveRoom]);

  const fetchMessages = useCallback(async (params = {}) => {
    if (!conversationId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await chatService.getMessages(conversationId, params);
      const items = (res && res.messages) || [];
      setHasMore(!!res?.hasMore);
      setNextCursor(res?.nextCursor || null);
      return items;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal memuat pesan');
      return [];
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const loadInitial = useCallback(async () => {
    const items = await fetchMessages({ limit: 30 });
    setMessages(items);
    // Store in context for cross-component sync
    if (conversationId) {
      setChatMessages((prev) => ({ ...prev, [conversationId]: items }));
    }
  }, [fetchMessages, conversationId, setChatMessages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor) return;
    const items = await fetchMessages({ limit: 30, cursor: nextCursor });
    setMessages((prev) => [...items, ...prev]);
    if (conversationId) {
      setChatMessages((prev) => ({ ...prev, [conversationId]: [...items, ...(prev[conversationId] || [])] }));
    }
  }, [fetchMessages, hasMore, nextCursor, conversationId, setChatMessages]);

  const send = useCallback(async (text, messageType = 'TEXT') => {
    if (!conversationId || !text.trim()) return null;
    try {
      const res = await chatService.sendMessage(conversationId, { message: text, messageType });
      const msg = res && res.message;
      if (msg) {
        setMessages((prev) => [...prev, msg]);
        setChatMessages((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), msg] }));
      }
      return msg;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal mengirim pesan');
      return null;
    }
  }, [conversationId, setChatMessages]);

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await chatService.markConversationRead(conversationId);
      if (orderNumber) emitMarkRead(`order:${orderNumber}`);
    } catch (e) { /* ignore */ }
  }, [conversationId, orderNumber, emitMarkRead]);

  const setTyping = useCallback((typing) => {
    if (!orderNumber) return;
    if (typing) {
      emitTyping(`order:${orderNumber}`);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => emitStopTyping(`order:${orderNumber}`), 2000);
    } else {
      emitStopTyping(`order:${orderNumber}`);
    }
  }, [orderNumber, emitTyping, emitStopTyping]);

  useEffect(() => {
    loadInitial();
    return () => clearTimeout(typingTimer.current);
  }, [loadInitial]);

  // Typing indicator for this conversation (exclude self)
  const typingUsersList = conversationId ? Object.keys(typingUsers[conversationId] || {}) : [];

  return {
    messages,
    loading,
    error,
    hasMore,
    nextCursor,
    loadInitial,
    loadMore,
    send,
    markRead,
    setTyping,
    typingUsers: typingUsersList,
  };
}

export default useChat;
