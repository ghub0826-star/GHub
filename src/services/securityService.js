import api from './api';

// Security service: 2FA, password, login activity, fraud alerts.

export async function get2FASetup() {
  return api.get('/auth/security/2fa/setup');
}

export async function enable2FA(code, secret) {
  return api.post('/auth/security/2fa/enable', { code, secret });
}

export async function disable2FA(code) {
  return api.post('/auth/security/2fa/disable', { code });
}

export async function verify2FALogin(userId, code, usingRecoveryCode = false) {
  return api.post('/auth/2fa/verify-login', { userId, code, usingRecoveryCode });
}

export async function getLoginActivity() {
  return api.get('/auth/security/login-activity');
}

export async function getFraudAlerts() {
  return api.get('/auth/security/fraud-alerts');
}

export async function changePassword(currentPassword, newPassword) {
  return api.post('/auth/change-password', { currentPassword, newPassword });
}

export async function sendVerificationEmail() {
  return api.post('/auth/send-verification');
}

export default {
  get2FASetup,
  enable2FA,
  disable2FA,
  verify2FALogin,
  getLoginActivity,
  getFraudAlerts,
  changePassword,
  sendVerificationEmail,
};
