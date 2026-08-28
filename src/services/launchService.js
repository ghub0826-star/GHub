import api from './api';

export async function getLaunchStatus() {
  const res = await api.get('/launch/status');
  return res.data;
}

export async function adminGetConfig() {
  const res = await api.get('/launch/admin/config');
  return res.data.config || {};
}

export async function adminSetLaunchMode(mode) {
  const res = await api.post('/launch/admin/mode', { mode });
  return res.data;
}

export async function adminSetMaintenance(enabled) {
  const res = await api.post('/launch/admin/maintenance', { enabled });
  return res.data;
}

export async function adminListReadiness() {
  const res = await api.get('/launch/admin/readiness');
  return res.data.items || [];
}

export async function adminUpdateReadiness(id, data) {
  const res = await api.patch(`/launch/admin/readiness/${id}`, data);
  return res.data.item;
}

export async function adminReadinessSummary() {
  const res = await api.get('/launch/admin/readiness/summary');
  return res.data.summary;
}
