import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setStatus('Masukkan email Anda terlebih dahulu.'); setIsError(true); return; }
    setLoading(true);
    setStatus(null);
    try {
      await forgotPassword(email);
      setIsError(false);
      setStatus('Jika email terdaftar, instruksi reset password telah dikirim. Periksa kotak masuk Anda.');
    } catch {
      setIsError(true);
      setStatus('Gagal menghubungi server. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <div className='card form-card' style={{ maxWidth: 480, margin: '40px auto' }}>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '1.3rem' }}>
            <i className='fa-solid fa-key' />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Lupa Password</h2>
            <p className='muted' style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              Kami akan kirimkan instruksi reset ke email Anda
            </p>
          </div>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className='fa-regular fa-envelope' style={{ color: '#64748b', fontSize: '0.85rem' }} />
            Alamat Email
          </label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type='email'
            placeholder='email@contoh.com'
            autoComplete='email'
            autoFocus
          />

          <button
            className='button'
            type='submit'
            disabled={loading}
            style={{ width: '100%', marginTop: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
          >
            <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`} />
            {loading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
          </button>
        </form>

        {status && (
          <div style={{
            marginTop: 14, padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10,
            background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
            color: isError ? '#ef4444' : '#10b981', fontSize: '0.88rem', fontWeight: 600,
          }}>
            <i className={`fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`} style={{ marginTop: 1, flexShrink: 0 }} />
            {status}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 8 }}>
          <Link to='/login' style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className='fa-solid fa-arrow-left' />
            Kembali ke Login
          </Link>
          <Link to='/' style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i className='fa-solid fa-house' />
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
