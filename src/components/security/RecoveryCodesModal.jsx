import React, { useState } from 'react';

export default function RecoveryCodesModal({ codes, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyCodes = () => {
    try {
      navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // clipboard unavailable
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className='card' style={{ maxWidth: 460, width: '100%' }}>
        <h3>Kode Pemulihan</h3>
        <p className='muted'>Simpan kode ini di tempat aman. Setiap kode hanya dapat digunakan sekali. Jangan bagikan kode ini kepada siapa pun.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          {codes.map((c, i) => (
            <div key={c} style={{ background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 6, fontFamily: 'monospace', textAlign: 'center' }}>
              {c}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className='button' onClick={copyCodes}>{copied ? 'Disalin!' : 'Salin Kode'}</button>
          <button className='button cta-outline' onClick={onClose}>Saya Sudah Menyimpan</button>
        </div>
      </div>
    </div>
  );
}
