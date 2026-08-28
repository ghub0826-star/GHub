import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/firebase';

export default function Login(){
  const [identity, setIdentity] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // 2FA state
  const [twoFactor, setTwoFactor] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

const { login, loginWithGoogle, loginAfter2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const redirectByRole = (role) => {
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    const r = String(role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (r === 'SELLER') {
      navigate('/seller/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const validate = () => {
    const e = {};
    if (!identity.trim()) e.identity = 'Email atau username wajib diisi';
    if (!password) e.password = 'Password wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) =>{
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try{
      const res = await login({ identity, password, remember });
      if (res && res.twoFactorRequired) {
        setTwoFactor({ userId: res.userId });
        setErrors({});
      } else if (res && res.success) {
        const userRole = res.user?.role || res.data?.user?.role;
        redirectByRole(userRole);
      } else {
        setErrors({ form: res?.message || 'Login gagal, periksa email dan password' });
      }
    }catch(err){
      setErrors({ form: err?.response?.data?.message || err?.message || 'Gagal login, coba lagi' });
    }finally{ setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});
    try {
      const idToken = await signInWithGoogle();
      const res = await loginWithGoogle(idToken);
      if (res?.success) redirectByRole(res.user?.role);
      else setErrors({ form: res?.message || 'Login Google gagal' });
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || err?.message || 'Login Google gagal, coba lagi' });
    } finally { setLoading(false); }
  };

const handle2FA = async (ev) =>{
    ev.preventDefault();
    if (!twoFactorCode.trim()) { setErrors({ form: 'Kode 2FA wajib diisi' }); return; }
    setTwoFactorLoading(true);
    try{
      const res = await loginAfter2FA({ userId: twoFactor.userId, code: twoFactorCode, usingRecoveryCode: useRecovery });
      if (res && res.success) {
        const userRole = res.user?.role || res.data?.user?.role;
        redirectByRole(userRole);
      } else {
        setErrors({ form: res?.message || 'Kode 2FA tidak valid' });
      }
    }catch(err){
      setErrors({ form: err?.response?.data?.message || err?.message || 'Gagal verifikasi 2FA' });
    }finally{ setTwoFactorLoading(false); }
  };

  return (
    <div className='container'>
      <div className='card form-card' style={{maxWidth:520,margin:'24px auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className='logo'><img src='/assets/logo.jpg' alt='GHub Logo' /></div>
          <div>
            <h2>Selamat Datang Kembali</h2>
            <div className='muted'>Masuk untuk melanjutkan transaksi dan pengelolaan akun Anda.</div>
          </div>
        </div>

{twoFactor ? (
          <form onSubmit={handle2FA} style={{marginTop:12}}>
            <h3>Verifikasi 2FA</h3>
            <p className='muted'>Masukkan kode dari aplikasi autentikator Anda atau kode cadangan.</p>
            {errors.form && <div className='error'>{errors.form}</div>}

            <label style={{marginTop:8}}>{useRecovery ? 'Kode Cadangan (Recovery Code)' : 'Kode 2FA'}</label>
            <input value={twoFactorCode} onChange={e=> setTwoFactorCode(e.target.value)} type='text' placeholder='123456' />
            <label style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
              <input type='checkbox' checked={useRecovery} onChange={e=> setUseRecovery(e.target.checked)} />
              Gunakan kode cadangan
            </label>

            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button className='button' type='submit' disabled={twoFactorLoading}>{twoFactorLoading? 'Memverifikasi...':'Verifikasi'}</button>
              <button type='button' className='button cta-outline' onClick={()=> { setTwoFactor(null); setTwoFactorCode(''); setUseRecovery(false); }}>Kembali</button>
            </div>
          </form>
        ) : (
        <form onSubmit={handleSubmit} style={{marginTop:12}}>
          {errors.form && <div className='error'>{errors.form}</div>}

          <label>Email atau Username</label>
          <input value={identity} onChange={e=> setIdentity(e.target.value)} type='text' placeholder='Email atau Username' />
          {errors.identity && <div className='error'>{errors.identity}</div>}

          <label style={{marginTop:8}}>Password</label>
          <div className='password-field'>
            <input value={password} onChange={e=> setPassword(e.target.value)} type={show? 'text':'password'} placeholder='Masukkan password' />
            <button type='button' onClick={()=> setShow(s=>!s)} className='password-toggle' aria-label={show? 'Sembunyikan password':'Tampilkan password'}>
              <img src={show? '/assets/hide.png':'/assets/view.png'} alt={show? 'Sembunyikan':'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>
          {errors.password && <div className='error'>{errors.password}</div>}

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
            <label style={{display:'flex',alignItems:'center',gap:8}}><input type='checkbox' checked={remember} onChange={e=> setRemember(e.target.checked)} /> Ingat saya</label>
            <Link to='/forgot-password' className='muted'>Lupa Password?</Link>
          </div>

          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className='button' type='submit' disabled={loading}>{loading? 'Memproses...':'Masuk'}</button>
            <Link to='/' className='button cta-outline'>Kembali ke Homepage</Link>
          </div>

          <button className='button cta-outline' type='button' onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', marginTop: 10 }}>
            Masuk dengan Google
          </button>

          <div style={{marginTop:12}}>
            Belum punya akun? <Link to='/register'>Daftar</Link>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
