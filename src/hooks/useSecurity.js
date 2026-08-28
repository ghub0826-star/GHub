import { useState, useCallback } from 'react';
import * as securityService from '../services/securityService';

export function useSecurity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const get2FASetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await securityService.get2FASetup();
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal mengambil data 2FA');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const enable2FA = useCallback(async (code, secret) => {
    setLoading(true);
    setError(null);
    try {
      const res = await securityService.enable2FA(code, secret);
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal mengaktifkan 2FA');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const disable2FA = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const res = await securityService.disable2FA(code);
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal menonaktifkan 2FA');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await securityService.changePassword(currentPassword, newPassword);
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal mengubah password');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoginActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await securityService.getLoginActivity();
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal mengambil aktivitas login');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, get2FASetup, enable2FA, disable2FA, changePassword, getLoginActivity };
}
