import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSecurity } from '../../hooks/useSecurity';
import TwoFactorModal from '../../components/security/TwoFactorModal';
import RecoveryCodesModal from '../../components/security/RecoveryCodesModal';
import PasswordStrength from '../../components/security/PasswordStrength';
import SecurityEventList from '../../components/security/SecurityEventList';

export default function SecuritySettings() {
  const { user } = useAuth();
  const { loading, get2FASetup, enable2FA, disable2FA, changePassword, getLoginActivity } = useSecurity();

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [events, setEvents] = useState([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleEnable2FA = async () => {
    setErr('');
    try {
      const res = await get2FASetup();
      setTwoFactorSecret(res.secret);
      setShow2FAModal(true);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Gagal memulai setup 2FA');
    }
  };

  const handleConfirm2FA = async (code) => {
    setErr('');
    try {
      const res = await enable2FA(code, twoFactorSecret);
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setRecoveryCodes(res.recoveryCodes || []);
      setMsg('2FA berhasil diaktifkan.');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Kode 2FA salah');
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Masukkan kode 2FA untuk menonaktifkan:');
    if (!code) return;
    setErr('');
    try {
      await disable2FA(code);
      setTwoFactorEnabled(false);
      setMsg('2FA berhasil dinonaktifkan.');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Kode 2FA salah');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (newPassword !== confirmPassword) {
      setErr('Konfirmasi password tidak cocok');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setMsg('Password berhasil diubah. Sesi perangkat lain telah diakhiri.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Gagal mengubah password');
    }
  };

  const handleLoadActivity = async () => {
    setErr('');
    try {
      const res = await getLoginActivity();
      setEvents(res.events || []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Gagal memuat aktivitas login');
    }
  };

  return (
    <div>
      <h1>Keamanan Akun</h1>
      <p className='muted'>Kelola keamanan akun Anda: 2FA, password, dan aktivitas login.</p>

      {msg && <div className='success'>{msg}</div>}
      {err && <div className='error'>{err}</div>}

      <div className='card' style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>Autentikasi Dua Faktor (2FA)</h4>
            <p className='muted'>{twoFactorEnabled ? '2FA aktif pada akun Anda.' : '2FA belum aktif. Aktifkan untuk keamanan ekstra.'}</p>
          </div>
          {twoFactorEnabled
            ? <button className='button cta-outline' onClick={handleDisable2FA} disabled={loading}>Nonaktifkan</button>
            : <button className='button' onClick={handleEnable2FA} disabled={loading}>Aktifkan</button>}
        </div>
      </div>

      <div className='card' style={{ marginTop: 12 }}>
        <h4>Ubah Password</h4>
        <form onSubmit={handleChangePassword}>
          <label>Password Saat Ini</label>
          <div className='password-field'>
            <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <button type='button' onClick={() => setShowCurrent(s => !s)} className='password-toggle' aria-label={showCurrent ? 'Sembunyikan password' : 'Tampilkan password'}>
              <img src={showCurrent ? '/assets/hide.png' : '/assets/view.png'} alt={showCurrent ? 'Sembunyikan' : 'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>

          <label style={{ marginTop: 8 }}>Password Baru</label>
          <div className='password-field'>
            <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            <button type='button' onClick={() => setShowNew(s => !s)} className='password-toggle' aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}>
              <img src={showNew ? '/assets/hide.png' : '/assets/view.png'} alt={showNew ? 'Sembunyikan' : 'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>
          <PasswordStrength password={newPassword} />

          <label style={{ marginTop: 8 }}>Konfirmasi Password Baru</label>
          <div className='password-field'>
            <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
            <button type='button' onClick={() => setShowConfirm(s => !s)} className='password-toggle' aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}>
              <img src={showConfirm ? '/assets/hide.png' : '/assets/view.png'} alt={showConfirm ? 'Sembunyikan' : 'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>

          <button className='button' type='submit' style={{ marginTop: 12 }} disabled={loading}>Ubah Password</button>
        </form>
      </div>

      <div className='card' style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>Aktivitas Login</h4>
          <button className='button small cta-outline' onClick={handleLoadActivity} disabled={loading}>Muat</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <SecurityEventList events={events} />
        </div>
      </div>

      {show2FAModal && (
        <TwoFactorModal
          secret={twoFactorSecret}
          onConfirm={handleConfirm2FA}
          onClose={() => setShow2FAModal(false)}
          loading={loading}
        />
      )}

      {recoveryCodes && (
        <RecoveryCodesModal codes={recoveryCodes} onClose={() => setRecoveryCodes(null)} />
      )}
    </div>
  );
}
