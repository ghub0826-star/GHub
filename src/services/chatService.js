import api from './api';

// Chat / conversation API service (matches backend conversationRoutes)

// Get or create the conversation tied to an order (BUYER/SELLER)
export async function getConversationForOrder(orderNumber) {
  const res = await api.get(`/orders/${orderNumber}/conversation`);
  return res.data;
}

// List conversations for the current user
export async function listConversations(params = {}) {
  const res = await api.get('/conversations', { params });
  return res.data;
}

// Get messages for a conversation (cursor pagination)
export async function getMessages(conversationId, params = {}) {
  const res = await api.get(`/conversations/${conversationId}/messages`, { params });
  return res.data;
}

// Send a text/system message
export async function sendMessage(conversationId, payload) {
  const res = await api.post(`/conversations/${conversationId}/messages`, payload);
  return res.data;
}

// Mark a conversation as read
export async function markConversationRead(conversationId) {
  const res = await api.post(`/conversations/${conversationId}/read`);
  return res.data;
}

// Upload an attachment (multipart)
export async function uploadAttachment(conversationId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/conversations/${conversationId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export default {
  getConversationForOrder,
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  uploadAttachment,
};
