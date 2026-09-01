import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/firebase';

export default function Login() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  // 2FA state
  const [twoFactor,       setTwoFactor]       = useState(null);
  const [twoFactorCode,   setTwoFactorCode]   = useState('');
  const [useRecovery,     setUseRecovery]     = useState(false);
  const [twoFactorLoading,setTwoFactorLoading]= useState(false);

  const { login, loginWithGoogle, loginAfter2FA } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const redirectByRole = (role) => {
    if (from && from !== '/login') { navigate(from, { replace: true }); return; }
    const r = String(role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') navigate('/admin/dashboard', { replace: true });
    else if (r === 'SELLER') navigate('/seller/dashboard', { replace: true });
    else navigate('/', { replace: true });
  };

  const validate = () => {
    const e = {};
    if (!identity.trim()) e.identity = 'Email atau username wajib diisi';
    if (!password)        e.password = 'Password wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ identity, password, remember });
      if (res?.twoFactorRequired) { setTwoFactor({ userId: res.userId }); setErrors({}); }
      else if (res?.success) redirectByRole(res.user?.role || res.data?.user?.role);
      else setErrors({ form: res?.message || 'Login gagal, periksa email dan password' });
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || err?.message || 'Gagal login, coba lagi' });
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setErrors({});
    try {
      const idToken = await signInWithGoogle();
      const res     = await loginWithGoogle(idToken);
      if (res?.success) redirectByRole(res.user?.role);
      else setErrors({ form: res?.message || 'Login Google gagal' });
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || err?.message || 'Login Google gagal, coba lagi' });
    } finally { setLoading(false); }
  };

  const handle2FA = async (ev) => {
    ev.preventDefault();
    if (!twoFactorCode.trim()) { setErrors({ form: 'Kode 2FA wajib diisi' }); return; }
    setTwoFactorLoading(true);
    try {
      const res = await loginAfter2FA({ userId: twoFactor.userId, code: twoFactorCode, usingRecoveryCode: useRecovery });
      if (res?.success) redirectByRole(res.user?.role || res.data?.user?.role);
      else setErrors({ form: res?.message || 'Kode 2FA tidak valid' });
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || err?.message || 'Gagal verifikasi 2FA' });
    } finally { setTwoFactorLoading(false); }
  };

  return (
    <div className='container'>
      <div className='card form-card' style={{ maxWidth: 480, margin: '40px auto' }}>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div className='logo'>
            <img src='/assets/Logo Ghub.png' alt='GHub Logo' />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Selamat Datang</h2>
            <p className='muted' style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              Masuk untuk melanjutkan ke GHub Marketplace
            </p>
          </div>
        </div>

        {/* ── 2FA Form ── */}
        {twoFactor ? (
          <form onSubmit={handle2FA}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <i className='fa-solid fa-shield-halved' style={{ color: '#818cf8', fontSize: '1.2rem' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f7f8ff', fontSize: '0.9rem' }}>Verifikasi Dua Faktor</div>
                <div className='muted' style={{ fontSize: '0.8rem' }}>Masukkan kode dari aplikasi autentikator</div>
              </div>
            </div>

            {errors.form && (
              <div className='error' style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <i className='fa-solid fa-circle-exclamation' />{errors.form}
              </div>
            )}

            <label>{useRecovery ? 'Kode Cadangan (Recovery Code)' : 'Kode 2FA (6 digit)'}</label>
            <input
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value)}
              type='text'
              inputMode='numeric'
              placeholder='123456'
              maxLength={useRecovery ? 20 : 6}
              autoFocus
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer' }}>
              <input type='checkbox' checked={useRecovery} onChange={e => setUseRecovery(e.target.checked)} />
              <span className='muted' style={{ fontSize: '0.85rem' }}>Gunakan kode cadangan</span>
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className='button' type='submit' disabled={twoFactorLoading} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className={`fa-solid ${twoFactorLoading ? 'fa-circle-notch fa-spin' : 'fa-shield-check'}`} />
                {twoFactorLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
              <button
                type='button'
                className='button cta-outline'
                onClick={() => { setTwoFactor(null); setTwoFactorCode(''); setUseRecovery(false); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <i className='fa-solid fa-arrow-left' /> Kembali
              </button>
            </div>
          </form>

        ) : (
          /* ── Login Form ── */
          <form onSubmit={handleSubmit}>
            {errors.form && (
              <div className='error' style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <i className='fa-solid fa-circle-exclamation' />{errors.form}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className='fa-regular fa-envelope' style={{ color: '#64748b', fontSize: '0.85rem' }} />
              Email atau Username
            </label>
            <input
              value={identity}
              onChange={e => setIdentity(e.target.value)}
              type='text'
              placeholder='email@contoh.com atau username'
              autoComplete='username'
            />
            {errors.identity && (
              <div className='error' style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                <i className='fa-solid fa-triangle-exclamation' />{errors.identity}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
              <i className='fa-solid fa-lock' style={{ color: '#64748b', fontSize: '0.85rem' }} />
              Password
            </label>
            <div className='password-field'>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder='Masukkan password'
                autoComplete='current-password'
              />
              <button
                type='button'
                onClick={() => setShow(s => !s)}
                className='password-toggle'
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                <img src={show ? '/assets/hide.png' : '/assets/view.png'} alt={show ? 'Sembunyikan' : 'Tampilkan'} className='password-toggle-icon' />
              </button>
            </div>
            {errors.password && (
              <div className='error' style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                <i className='fa-solid fa-triangle-exclamation' />{errors.password}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type='checkbox' checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span className='muted' style={{ fontSize: '0.85rem' }}>Ingat saya</span>
              </label>
              <Link to='/forgot-password' style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <i className='fa-solid fa-key' style={{ fontSize: '0.75rem' }} />
                Lupa Password?
              </Link>
            </div>

            {/* Primary action */}
            <button
              className='button'
              type='submit'
              disabled={loading}
              style={{ width: '100%', marginTop: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-right-to-bracket'}`} />
              {loading ? 'Memproses...' : 'Masuk ke Akun'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span className='muted' style={{ fontSize: '0.78rem' }}>atau</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google login */}
            <button
              className='button cta-outline'
              type='button'
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', fontSize: '0.9rem' }}
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
                <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
                <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
                <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
                <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
              </svg>
              Masuk dengan Google
            </button>

            {/* Footer links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 8 }}>
              <span className='muted' style={{ fontSize: '0.85rem' }}>
                Belum punya akun?{' '}
                <Link to='/register' style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Daftar Sekarang</Link>
              </span>
              <Link to='/' style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <i className='fa-solid fa-house' />
                Beranda
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
