import api from './api';

export async function listPublicDocuments() {
  const res = await api.get('/legal');
  return res.data.documents || [];
}

export async function getPublicDocument(slug) {
  const res = await api.get(`/legal/${slug}`);
  return res.data.document || null;
}

export async function acceptDocument(documentId) {
  const res = await api.post('/legal/accept', { documentId });
  return res.data;
}

export async function listMyAcceptances() {
  const res = await api.get('/legal/me/acceptances');
  return res.data.acceptances || [];
}

// Admin
export async function adminListDocuments() {
  const res = await api.get('/legal/admin/all');
  return res.data.documents || [];
}

export async function adminGetVersions(documentKey) {
  const res = await api.get(`/legal/admin/${documentKey}/versions`);
  return res.data.versions || [];
}

export async function adminCreateDocument(data) {
  const res = await api.post('/legal/admin', data);
  return res.data.document;
}

export async function adminUpdateDocument(id, data) {
  const res = await api.put(`/legal/admin/${id}`, data);
  return res.data.document;
}
