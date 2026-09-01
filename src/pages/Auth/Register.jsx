import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { register as registerSvc } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/firebase';

const usernamePattern = /^[A-Za-z0-9_.]{3,}$/;
const phonePattern = /^[0-9+\- ]{6,20}$/;

// Reusable label that shows a required-field star
const FormLabel = ({ children, required }) => (
  <label>
    {children}{required && <span className='required-star' aria-label='wajib'> *</span>}
  </label>
);

export default function Register(){
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  // Real-time validation (fires as user types)
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim() ? '' : 'Nama lengkap wajib diisi';
      case 'username':
        return usernamePattern.test(value) ? '' : 'Username minimal 3 karakter, hanya huruf, angka, underscore atau titik';
      case 'email':
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? '' : 'Email tidak valid';
      case 'phone':
        return phonePattern.test(value) ? '' : 'Nomor WhatsApp tidak valid';
      case 'password':
        if (value.length < 8) return 'Password minimal 8 karakter';
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
          return 'Password harus memiliki huruf besar, huruf kecil, dan angka';
        }
        return '';
      case 'confirm':
        if (!value) return 'Konfirmasi password wajib diisi';
        return value === password ? '' : 'Konfirmasi password tidak cocok';
      default:
        return '';
    }
  };

  // Compute current errors without mutating state (for button-enable check)
  const computedErrors = useMemo(() => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Nama lengkap wajib diisi';
    if (!usernamePattern.test(username)) e.username = 'Username minimal 3 karakter, hanya huruf, angka, underscore atau titik';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Email tidak valid';
    if (!phonePattern.test(phone)) e.phone = 'Nomor WhatsApp tidak valid';
    if (password.length < 8) {
      e.password = 'Password minimal 8 karakter';
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = 'Password harus memiliki huruf besar, huruf kecil, dan angka';
    }
    if (!confirm) e.confirm = 'Konfirmasi password wajib diisi';
    else if (confirm !== password) e.confirm = 'Konfirmasi password tidak cocok';
    if (!agree) e.agree = 'Anda harus menyetujui Syarat dan Ketentuan';
    return e;
  }, [fullName, username, email, phone, password, confirm, agree]);

  // Button is enabled only when all required fields are valid AND no errors
  const isFormValid = Object.keys(computedErrors).length === 0;

  const handleChange = (name, value) => {
    // Clear error for this field as user types (real-time)
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (ev) =>{
    ev.preventDefault();
    // Merge computed (real-time) errors with any persisted errors
    setErrors(computedErrors);
    if (!isFormValid) return;
    setLoading(true);
    try{
      const payload = { full_name: fullName, username, email, phone, password };
      const res = await registerSvc(payload);
      if (res.data && res.data.success) {
        if (typeof login === 'function') {
          const loginResult = await login({ identity: email, password });
          if (!loginResult?.success) {
            setErrors({ form: 'Akun berhasil dibuat. Silakan masuk untuk melanjutkan.' });
          }
        }
        navigate('/');
      } else {
        setErrors({ form: res.data?.message || 'Registrasi gagal' });
      }
    }catch(err){
      setErrors({ form: err?.response?.data?.message || 'Gagal mendaftar, coba lagi' });
    }finally{ setLoading(false); }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrors({});
    try {
      const idToken = await signInWithGoogle();
      const res = await loginWithGoogle(idToken);
      if (res?.success) navigate('/');
      else setErrors({ form: res?.message || 'Registrasi Google gagal' });
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || err?.message || 'Registrasi Google gagal, coba lagi' });
    } finally { setLoading(false); }
  };

  return (
    <div className='container'>
      <div className='card form-card' style={{maxWidth:640,margin:'20px auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className='logo'><img src='/assets/Logo Ghub.png' alt='GHub Logo' /></div>
          <div>
            <h2>Daftar Akun Baru</h2>
            <p className='muted'>Buat akun BUYER untuk mulai membeli. Pilih opsi Seller setelah verifikasi toko.</p>
          </div>
        </div>
        {errors.form && <div className='error'>{errors.form}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <FormLabel required>Nama Lengkap</FormLabel>
          <input type='text' value={fullName} onChange={e=>{ setFullName(e.target.value); handleChange('fullName'); }} />
          {errors.fullName && <div className='error'>{errors.fullName}</div>}

          <FormLabel required>Username</FormLabel>
          <input type='text' value={username} onChange={e=>{ setUsername(e.target.value); handleChange('username'); }} />
          {errors.username && <div className='error'>{errors.username}</div>}

          <FormLabel required>Email</FormLabel>
          <input value={email} onChange={e=>{ setEmail(e.target.value); handleChange('email'); }} type='email' />
          {errors.email && <div className='error'>{errors.email}</div>}

          <FormLabel required>Nomor WhatsApp</FormLabel>
          <input type='text' value={phone} onChange={e=>{ setPhone(e.target.value); handleChange('phone'); }} />
          {errors.phone && <div className='error'>{errors.phone}</div>}

          <FormLabel required>Password</FormLabel>
          <div className='password-field'>
            <input value={password} onChange={e=>{ setPassword(e.target.value); handleChange('password'); }} type={showPass? 'text':'password'} placeholder='Minimal 8 karakter' />
            <button type='button' onClick={()=> setShowPass(s=>!s)} className='password-toggle' aria-label={showPass? 'Sembunyikan password':'Tampilkan password'}>
              <img src={showPass? '/assets/hide.png':'/assets/view.png'} alt={showPass? 'Sembunyikan':'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>
          {errors.password && <div className='error'>{errors.password}</div>}

          <FormLabel required>Konfirmasi Password</FormLabel>
          <div className='password-field'>
            <input value={confirm} onChange={e=>{ setConfirm(e.target.value); handleChange('confirm'); }} type={showConfirm? 'text':'password'} placeholder='Ulangi password' />
            <button type='button' onClick={()=> setShowConfirm(s=>!s)} className='password-toggle' aria-label={showConfirm? 'Sembunyikan password':'Tampilkan password'}>
              <img src={showConfirm? '/assets/hide.png':'/assets/view.png'} alt={showConfirm? 'Sembunyikan':'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>
          {errors.confirm && <div className='error'>{errors.confirm}</div>}

          <label style={{display:'flex',alignItems:'center',gap:8}}>
            <input type='checkbox' checked={agree} onChange={e=> setAgree(e.target.checked)} />
            Saya setuju dengan{' '}
            <Link to='/terms' target='_blank' rel='noopener noreferrer'>Syarat dan Ketentuan</Link>
            {' '}dan{' '}
            <Link to='/privacy' target='_blank' rel='noopener noreferrer'>Kebijakan Privasi</Link>
          </label>
          {errors.agree && <div className='error'>{errors.agree}</div>}

          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className='button primary' type='submit' disabled={loading} style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
              <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-user-plus'}`} />
              {loading? 'Memproses...':'Daftar Akun'}
            </button>
            <Link to='/login' className='button cta-outline' style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
              <i className='fa-solid fa-right-to-bracket' />
              Sudah punya akun? Masuk
            </Link>
          </div>
          <button className='button cta-outline' type='button' onClick={handleGoogleRegister} disabled={loading} style={{ width: '100%', marginTop: 10, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
              <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
              <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
              <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
              <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
            </svg>
            Daftar dengan Google
          </button>
        </form>
      </div>
    </div>
  );
}
