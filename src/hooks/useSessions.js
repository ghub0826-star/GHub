import { useState, useCallback, useEffect } from 'react';
import * as sessionService from '../services/sessionService';

export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sessionService.getSessions();
      setSessions(res.data.sessions || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal mengambil sesi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const revoke = useCallback(async (sessionId) => {
    await sessionService.revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const logoutOtherDevices = useCallback(async () => {
    const res = await sessionService.logoutOtherDevices();
    await loadSessions();
    return res.data;
  }, [loadSessions]);

  return { sessions, loading, error, loadSessions, revoke, logoutOtherDevices };
}
