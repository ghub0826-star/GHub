import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import * as authService from '../services/authService';
import * as sessionService from '../services/sessionService';
import * as securityService from '../services/securityService';

const AuthContext = createContext(null);

const ACCESS_KEY = 'ghub_access_token';
const REFRESH_KEY = 'ghub_refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  function setStoredTokens(accessToken, refreshToken) {
    try {
      if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
      else localStorage.removeItem(ACCESS_KEY);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      else localStorage.removeItem(REFRESH_KEY);
      if (accessToken) api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      else delete api.defaults.headers.common.Authorization;
    } catch (e) { /* ignore */ }
  }

  useEffect(()=>{
    let mounted = true;
    const init = async ()=>{
      try{
        const storedAccess = localStorage.getItem(ACCESS_KEY);
        const refresh = localStorage.getItem(REFRESH_KEY);

        if (storedAccess) {
          api.defaults.headers.common.Authorization = `Bearer ${storedAccess}`;
          const res = await authService.getCurrentUser();
          if (!mounted) return;
          if (res.data && res.data.success) {
            const u = res.data.user;
            setUser(u);
            try{ localStorage.setItem('ghub_user', JSON.stringify({ id: u.id, username: u.username, email: u.email, role: u.role })); }catch{}
          }
        } else if (refresh) {
          try {
            const rr = await sessionService.refreshToken(refresh);
            if (rr.data && rr.data.success) {
              setStoredTokens(rr.data.accessToken, rr.data.refreshToken);
              setUser(rr.data.user);
            }
          } catch (e) { /* session expired */ }
        }
      }catch(e){
        // silent
      }finally{
        if (mounted) setIsLoading(false);
      }
    };
    init();
    return ()=> mounted = false;
  }, []);

  const isAuthenticated = useMemo(()=> !!user, [user]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const data = res.data;
    // 2FA required
    if (data && data.success && data.twoFactorRequired) {
      return { success: true, twoFactorRequired: true, userId: data.userId };
    }
    // Standard login with access/refresh tokens
    if (data && data.success && data.accessToken) {
      const u = data.user;
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(u);
      try{ localStorage.setItem('ghub_user', JSON.stringify({ id: u.id, username: u.username, email: u.email, role: u.role })); }catch{}
      return { success: true, twoFactorRequired: false, user: u };
    }
    return data;
  };

  const loginWithGoogle = async (idToken) => {
    const res = await authService.loginWithFirebase(idToken);
    const data = res.data;
    if (data && data.success && data.accessToken) {
      const u = data.user || data.data?.user;
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(u);
      try { localStorage.setItem('ghub_user', JSON.stringify({ id: u.id, username: u.username, email: u.email, role: u.role })); } catch (e) { /* ignore */ }
      return { success: true, user: u };
    }
    return data;
  };

const register = async (payload) => {
    const res = await authService.register(payload);
    return res.data;
  };

  // Called after 2FA verification succeeds at login.
  const loginAfter2FA = async (payload) => {
    const res = await securityService.verify2FALogin(payload.userId, payload.code, payload.usingRecoveryCode);
    const data = res.data;
    if (data && data.success && data.accessToken) {
      const u = data.user;
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(u);
      try{ localStorage.setItem('ghub_user', JSON.stringify({ id: u.id, username: u.username, email: u.email, role: u.role })); }catch{}
      return { success: true, user: u };
    }
    return data;
  };

  const logout = async () => {
    try{ await authService.logout(); }catch{}
    setUser(null);
    setStoredTokens(null, null);
    try{ localStorage.removeItem('ghub_user'); }catch{}
  };

  const updateUser = (patch) => setUser(prev => ({ ...prev, ...patch }));

  const hasRole = (roles) => {
    if (!user) return false;
    if (!roles || roles.length === 0) return true;
    const currentRole = String(user.role || 'USER').toUpperCase();
    const legacyRole = String(user.legacyRole || '').toUpperCase();
    const isSuperAdmin = currentRole === 'SUPER_ADMIN' || legacyRole === 'SUPER_ADMIN';
    const normalizedUserRole = ['USER', 'BUYER', 'CUSTOMER'].includes(currentRole) ? 'BUYER' : currentRole;
    return roles.some((r) => {
      const normalizedTarget = String(r).toUpperCase();
      if (normalizedTarget === 'SUPER_ADMIN' && isSuperAdmin) return true;
      if (normalizedTarget === 'ADMIN' && (currentRole === 'ADMIN' || isSuperAdmin)) return true;
      return (
        normalizedTarget === currentRole ||
        normalizedTarget === legacyRole ||
        (normalizedTarget === 'BUYER' && (currentRole === 'USER' || currentRole === 'BUYER')) ||
        (normalizedTarget === 'USER' && (currentRole === 'USER' || currentRole === 'BUYER')) ||
        normalizedTarget === normalizedUserRole
      );
    });
  };

  return (
<AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginWithGoogle, loginAfter2FA, register, logout, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){
  return useContext(AuthContext);
}
