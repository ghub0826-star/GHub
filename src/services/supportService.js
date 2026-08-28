import api from './api';

export async function listSupportCategories() {
  const res = await api.get('/support/categories');
  return res.data.categories || [];
}

export async function createTicket(data) {
  const res = await api.post('/support', data);
  return res.data.ticket;
}

export async function listMyTickets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await api.get(`/support/my${qs ? `?${qs}` : ''}`);
  return res.data.tickets || [];
}

export async function getMyTicket(ticketCode) {
  const res = await api.get(`/support/my/${ticketCode}`);
  return res.data.ticket || null;
}

export async function replyTicket(ticketCode, message) {
  const res = await api.post(`/support/my/${ticketCode}/reply`, { message });
  return res.data;
}

export async function cancelTicket(ticketCode) {
  const res = await api.post(`/support/my/${ticketCode}/cancel`);
  return res.data;
}

// Admin
export async function adminSlaOverview() {
  const res = await api.get('/support/admin/sla');
  return res.data.overview;
}

export async function adminListTickets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await api.get(`/support/admin/tickets${qs ? `?${qs}` : ''}`);
  return res.data.tickets || [];
}

export async function adminGetTicket(id) {
  const res = await api.get(`/support/admin/tickets/${id}`);
  return res.data.ticket || null;
}

export async function adminReplyTicket(id, { message, isInternal }) {
  const res = await api.post(`/support/admin/tickets/${id}/reply`, { message, isInternal });
  return res.data;
}

export async function adminUpdateTicketStatus(id, status) {
  const res = await api.patch(`/support/admin/tickets/${id}/status`, { status });
  return res.data;
}

export async function adminAssignAgent(id, agentId) {
  const res = await api.post(`/support/admin/tickets/${id}/assign`, { agentId });
  return res.data;
}
