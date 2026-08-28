import React, { useState } from 'react';

// Displays sensitive account credentials ONLY to the owning buyer.
// Credentials come from the backend (already decrypted server-side and authorized).
export default function AccountDeliveryInfo({ delivery }) {
  const [revealed, setRevealed] = useState(false);

  if (!delivery || delivery.delivery_type !== 'ACCOUNT') return null;
  const data = delivery.accountData || {};

  const copy = (text) => {
    try { navigator.clipboard.writeText(text); } catch (_) {}
  };

  return (
    <div className='card' style={{ marginTop: 12, border: '1px solid rgba(79,70,229,0.3)' }}>
      <h4>🔐 Informasi Akun</h4>
      <p className='muted'>Data ini hanya dapat dilihat oleh pembeli yang memilikinya.</p>
      {!revealed ? (
        <button className='button' onClick={() => setRevealed(true)}>Lihat Kredensial</button>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {data.username && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Username: <strong>{data.username}</strong></span>
              <button className='button small' onClick={() => copy(data.username)}>Salin Username</button>
            </div>
          )}
          {data.password && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Password: <strong>{data.password}</strong></span>
              <button className='button small' onClick={() => copy(data.password)}>Salin Password</button>
            </div>
          )}
          {data.email && <div>Email: {data.email}</div>}
          {data.notes && <div className='muted'>Catatan: {data.notes}</div>}
        </div>
      )}
    </div>
  );
}
