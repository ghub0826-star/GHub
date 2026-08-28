import React from 'react';
import { useSessions } from '../../hooks/useSessions';
import DeviceCard from '../../components/security/DeviceCard';

export default function DeviceManagement() {
  const { sessions, loading, error, revoke, logoutOtherDevices } = useSessions();
  const [msg, setMsg] = React.useState('');

  const findCurrent = (s) => s.is_current;

  const handleLogoutOthers = async () => {
    if (!confirm('Akhiri semua sesi perangkat lain?')) return;
    try {
      const res = await logoutOtherDevices();
      setMsg(res.message || 'Sesi perangkat lain telah diakhiri.');
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Gagal mengakhiri sesi lain.');
    }
  };

  return (
    <div>
      <h1>Manajemen Perangkat</h1>
      <p className='muted'>Kelola perangkat yang masuk ke akun Anda.</p>

      {msg && <div className='success'>{msg}</div>}
      {error && <div className='error'>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button className='button small cta-outline' onClick={handleLogoutOthers} disabled={loading}>Akhiri Sesi Lain</button>
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {loading && <p className='muted'>Memuat sesi...</p>}
        {!loading && sessions.map((s) => (
          <DeviceCard key={s.id} session={s} current={findCurrent(s)} onRevoke={revoke} />
        ))}
        {!loading && sessions.length === 0 && <p className='muted'>Tidak ada sesi aktif.</p>}
      </div>
    </div>
  );
}
