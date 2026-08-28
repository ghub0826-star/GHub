import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * TwoFactorModal
 *
 * Props:
 *   secret      — base32 TOTP secret returned from GET /api/auth/security/2fa/setup
 *   otpAuthUrl  — otpauth:// URI for QR code (optional; modal generates from secret if missing)
 *   onConfirm   — (code: string) => void
 *   onClose     — () => void
 *   loading     — boolean
 */
export default function TwoFactorModal({ secret, otpAuthUrl, onConfirm, onClose, loading }) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const qrValue = otpAuthUrl || (secret
    ? `otpauth://totp/GHub%3A${encodeURIComponent('akun@ghub.dev')}?secret=${secret}&issuer=GHub`
    : '');

  const copySecret = () => {
    navigator.clipboard?.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="2fa-modal-title"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{ maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h3 id="2fa-modal-title" style={{ marginTop: 0 }}>Aktifkan Autentikasi Dua Faktor</h3>

        {/* Step 1 */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 6 }}>Langkah 1 — Scan QR Code</h4>
          <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            Buka aplikasi autentikator (Google Authenticator, Microsoft Authenticator, atau Authy)
            lalu scan kode QR berikut.
          </p>

          {qrValue ? (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
              <div style={{
                background: '#fff', padding: 12, borderRadius: 8,
                display: 'inline-block', lineHeight: 0,
              }}>
                <QRCodeSVG value={qrValue} size={180} level="M" />
              </div>
            </div>
          ) : (
            <div className="muted" style={{ textAlign: 'center', padding: 16 }}>
              QR code tidak tersedia
            </div>
          )}

          <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginBottom: 6 }}>
            Tidak bisa scan? Masukkan kunci manual ke aplikasi autentikator:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
            <span style={{
              fontFamily: 'monospace', fontSize: 14,
              wordBreak: 'break-all', letterSpacing: '0.05em',
            }}>
              {secret}
            </span>
            <button
              type="button"
              className="button small cta-outline"
              onClick={copySecret}
              style={{ flexShrink: 0, fontSize: 12 }}
            >
              {copied ? '✓ Disalin' : 'Salin'}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div>
          <h4 style={{ marginBottom: 6 }}>Langkah 2 — Masukkan Kode 6 Digit</h4>
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            Masukkan kode yang ditampilkan aplikasi autentikator untuk mengonfirmasi setup.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            style={{
              width: '100%',
              fontSize: 22,
              letterSpacing: '0.4em',
              textAlign: 'center',
              fontFamily: 'monospace',
              padding: '10px 0',
            }}
            aria-label="Kode 6 digit dari aplikasi autentikator"
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="button"
            onClick={() => onConfirm(code)}
            disabled={loading || code.length !== 6}
            style={{ flex: 1 }}
          >
            {loading ? 'Memverifikasi...' : 'Aktifkan 2FA'}
          </button>
          <button
            className="button cta-outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>
        </div>

        <p className="muted" style={{ fontSize: 11, marginTop: 12, textAlign: 'center' }}>
          Setelah diaktifkan, Anda akan mendapat 10 recovery code. Simpan baik-baik.
        </p>
      </div>
    </div>
  );
}
