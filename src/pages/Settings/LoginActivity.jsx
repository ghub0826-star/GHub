import React, { useState } from 'react';
import { useSecurity } from '../../hooks/useSecurity';
import SecurityEventList from '../../components/security/SecurityEventList';

export default function LoginActivity() {
  const { getLoginActivity } = useSecurity();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await getLoginActivity();
      setEvents(res.events || []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Gagal memuat aktivitas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Aktivitas Login</h1>
      <p className='muted'>Riwayat aktivitas keamanan dan login akun Anda.</p>
      {err && <div className='error'>{err}</div>}
      <div style={{ marginTop: 12 }}>
        <button className='button small' onClick={load} disabled={loading}>{loading ? 'Memuat...' : 'Muat Aktivitas'}</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <SecurityEventList events={events} />
      </div>
    </div>
  );
}
