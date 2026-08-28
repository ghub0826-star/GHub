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
          <div className='logo'><img src='/assets/logo.jpg' alt='GHub Logo' /></div>
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
            <button className='button primary' type='submit' disabled={loading}>{loading? 'Memproses...':'Daftar'}</button>
            <Link to='/login' className='button cta-outline'>Sudah punya akun? Masuk</Link>
          </div>
          <button className='button cta-outline' type='button' onClick={handleGoogleRegister} disabled={loading} style={{ width: '100%', marginTop: 10 }}>
            Daftar dengan Google
          </button>
        </form>
      </div>
    </div>
  );
}
