/**
 * adminService.js
 * Semua panggilan API untuk halaman admin (users & sellers).
 * Semua endpoint memerlukan token dengan role ADMIN / SUPER_ADMIN.
 */
import api from './api';

// ─── USERS (Buyer Management) ─────────────────────────────

export function listUsers(params = {}) {
  return api.get('/admin/users', { params });
}

export function getUserDetail(userId) {
  return api.get(`/admin/users/${userId}`);
}

export function updateUserStatus(userId, status) {
  return api.patch(`/admin/users/${userId}/status`, { status });
}

export function suspendUser(userId, reason = '') {
  return api.post(`/admin/users/${userId}/suspend`, { reason });
}

export function restoreUser(userId) {
  return api.post(`/admin/users/${userId}/restore`);
}

export function forceLogoutUser(userId) {
  return api.post(`/admin/users/${userId}/force-logout`);
}

// Super Admin: buat akun buyer atau seller baru
export function createUser(payload) {
  return api.post('/admin/users', payload);
}

// ─── SELLERS (Seller Management) ──────────────────────────

export function listSellers(params = {}) {
  return api.get('/admin/sellers', { params });
}

export function getSellerDetail(sellerId) {
  return api.get(`/admin/sellers/${sellerId}`);
}

export function updateSellerStatus(sellerId, status) {
  return api.patch(`/admin/sellers/${sellerId}/status`, { status });
}

export function approveSeller(sellerId, note = '') {
  return api.post(`/admin/sellers/${sellerId}/approve`, { note });
}

export function rejectSeller(sellerId, reason) {
  return api.post(`/admin/sellers/${sellerId}/reject`, { reason });
}

export function requestRevision(sellerId, reason) {
  return api.post(`/admin/sellers/${sellerId}/request-revision`, { reason });
}

export function suspendSeller(sellerId, reason = '') {
  return api.post(`/admin/sellers/${sellerId}/suspend`, { reason });
}

export function restoreSeller(sellerId, note = '') {
  return api.post(`/admin/sellers/${sellerId}/restore`, { note });
}
