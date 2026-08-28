import api from './api';

export async function register(payload){
  return api.post('/auth/register', payload);
}

export async function login(credentials){
  return api.post('/auth/login', credentials);
}

export async function loginWithFirebase(idToken){
  return api.post('/auth/firebase', { idToken });
}

export async function logout(){
  return api.post('/auth/logout');
}

export async function getCurrentUser(){
  return api.get('/auth/me');
}

export async function forgotPassword(email){
  return api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token, password){
  return api.post('/auth/reset-password', { token, password });
}

export async function verifyEmail(token){
  return api.post('/auth/verify-email', { token });
}

export default { register, login, loginWithFirebase, logout, getCurrentUser, forgotPassword, resetPassword, verifyEmail };
