import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSecurity } from '../../hooks/useSecurity';
import TwoFactorModal from '../../components/security/TwoFactorModal';
import RecoveryCodesModal from '../../components/security/RecoveryCodesModal';

/**
 * TwoFactorSetup — standalone 2FA setup page.
 * Usable from any role: buyer, seller, admin.
 * After activation, shows recovery codes then redirects back.
 */
export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, get2FASetup, enable2FA, disable2FA } = useSecurity();

  const [show2FAModal, setShow2FAModal]   = useState(false);
  const [twoFactorSecret, setSecret]      = useState('');
  const [otpAuthUrl, setOtpAuthUrl]       = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [enabled, setEnabled]             = useState(user?.two_factor_enabled || false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  const handleEnable = async () => {
    setError(''); setSuccess('');
    try {
      const res = await get2FASetup();
      setSecret(res.secret || '');
      setOtpAuthUrl(res.otpAuthUrl || res.uri || '');
      setShow2FAModal(true);
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal memulai setup 2FA. Coba lagi.');
    }
  };

  const handleConfirm = async (code) => {
    setError('');
    try {
      const res = await enable2FA(code, twoFactorSecret);
      setEnabled(true);
      setShow2FAModal(false);
      setRecoveryCodes(res.recoveryCodes || []);
      setSuccess('2FA berhasil diaktifkan. Simpan recovery code Anda di tempat yang aman.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Kode tidak valid. Pastikan waktu perangkat Anda akurat.');
    }
  };

  const handleDisable = async () => {
    const code = window.prompt('Masukkan kode 2FA dari aplikasi autentikator untuk menonaktifkan:');
    if (!code) return;
    setError(''); setSuccess('');
    try {
      await disable2FA(code);
      setEnabled(false);
      setSuccess('2FA berhasil dinonaktifkan.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Kode tidak valid.');
    }
  };

  return (
    <div>
      <h1>Autentikasi Dua Faktor (2FA)</h1>
      <p className="muted">
        2FA menambahkan lapisan keamanan ekstra — selain password, Anda perlu memasukkan
        kode dari aplikasi autentikator setiap kali login.
      </p>

      {error   && <div className="error"   style={{ marginTop: 12 }}>{error}</div>}
      {success && <div className="success" style={{ marginTop: 12 }}>{success}</div>}

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h4 style={{ margin: 0 }}>Status 2FA</h4>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              {enabled
                ? '✅ Aktif — akun Anda dilindungi dengan 2FA.'
                : '⚠️ Tidak aktif — aktifkan untuk keamanan yang lebih baik.'}
            </p>
          </div>
          {enabled ? (
            <button className="button cta-outline" onClick={handleDisable} disabled={loading}>
              {loading ? 'Memproses...' : 'Nonaktifkan 2FA'}
            </button>
          ) : (
            <button className="button" onClick={handleEnable} disabled={loading}>
              {loading ? 'Memuat...' : 'Aktifkan 2FA'}
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h4>Cara kerja 2FA</h4>
        <ol style={{ margin: '8px 0', paddingLeft: 20, lineHeight: 1.7 }}>
          <li>Install aplikasi autentikator: <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, atau <strong>Authy</strong>.</li>
          <li>Klik "Aktifkan 2FA" dan scan QR code dengan aplikasi.</li>
          <li>Masukkan kode 6 digit yang ditampilkan aplikasi untuk mengonfirmasi.</li>
          <li>Simpan <strong>recovery code</strong> yang diberikan — ini digunakan jika Anda kehilangan akses ke aplikasi autentikator.</li>
        </ol>
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="button cta-outline small" onClick={() => navigate(-1)}>
          ← Kembali
        </button>
      </div>

      {show2FAModal && (
        <TwoFactorModal
          secret={twoFactorSecret}
          otpAuthUrl={otpAuthUrl}
          onConfirm={handleConfirm}
          onClose={() => setShow2FAModal(false)}
          loading={loading}
        />
      )}

      {recoveryCodes && (
        <RecoveryCodesModal
          codes={recoveryCodes}
          onClose={() => setRecoveryCodes(null)}
        />
      )}
    </div>
  );
}
