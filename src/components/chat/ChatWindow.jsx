import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessageBubble from './ChatMessageBubble';
import ChatInput from './ChatInput';
import { useChat } from '../../hooks/useChat';

// Full chat window for a single conversation.
// Props: conversationId, orderNumber, currentUserId, title, subtitle
export default function ChatWindow({ conversationId, orderNumber, currentUserId, title, subtitle }) {
  const {
    messages,
    loading,
    error,
    send,
    markRead,
    setTyping,
    typingUsers,
  } = useChat(conversationId, orderNumber);

  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark conversation read when opened
  useEffect(() => {
    if (conversationId) markRead();
  }, [conversationId, markRead]);

  return (
    <div className='card' style={{ display: 'flex', flexDirection: 'column', height: 520 }}>
      <ChatHeader title={title} subtitle={subtitle} typing={typingUsers} />

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column' }}>
        {loading && messages.length === 0 ? (
          <div className='muted' style={{ textAlign: 'center', padding: 20 }}>Memuat pesan...</div>
        ) : error && messages.length === 0 ? (
          <div className='muted' style={{ textAlign: 'center', padding: 20 }}>{error}</div>
        ) : messages.length === 0 ? (
          <div className='muted' style={{ textAlign: 'center', padding: 20 }}>Belum ada pesan. Mulai percakapan!</div>
        ) : (
          messages.map((m, i) => {
            const isOwn = m.sender_id === currentUserId;
            return <ChatMessageBubble key={m.id || i} message={m} isOwn={isOwn} />;
          })
        )}
      </div>

      <ChatInput onSend={(text) => send(text)} onTyping={setTyping} disabled={!conversationId} />
    </div>
  );
}
