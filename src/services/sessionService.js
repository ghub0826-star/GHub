import api from './api';

// Session management service.

export async function getSessions() {
  return api.get('/auth/sessions');
}

export async function revokeSession(sessionId) {
  return api.delete(`/auth/sessions/${sessionId}`);
}

export async function logoutOtherDevices() {
  return api.post('/auth/logout-other-devices');
}

export async function refreshToken(refreshToken) {
  return api.post('/auth/refresh', { refreshToken });
}

export default { getSessions, revokeSession, logoutOtherDevices, refreshToken };
