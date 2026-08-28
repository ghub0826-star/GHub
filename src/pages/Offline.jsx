import React from 'react';
import { Link } from 'react-router-dom';

export default function Offline() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
        <h2>Koneksi internet tidak tersedia</h2>
        <p style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
          Kamu sedang offline. Beberapa fitur seperti pembayaran dan checkout tidak dapat
          dilakukan tanpa koneksi internet.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <button className="button" onClick={() => window.location.reload()}>
            Coba Lagi
          </button>
          <Link to="/" className="button" style={{ background: 'transparent' }}>
            Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
