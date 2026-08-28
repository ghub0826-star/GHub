import React, { useState } from 'react';
import { resetPassword } from '../../services/authService';
import { useSearchParams, Link } from 'react-router-dom';

export default function ResetPassword(){
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if (!password || password.length < 8) return setStatus('Password minimal 8 karakter');
    if (password !== confirm) return setStatus('Konfirmasi tidak cocok');
    setLoading(true);
    try{
      await resetPassword(token, password);
      setStatus('Password diperbarui. Silakan login.');
    }catch(e){
      setStatus('Gagal mereset password. Token mungkin tidak valid.');
    }finally{ setLoading(false); }
  };

  if (!token) return (
    <div className='container'><div className='card'><p>Token reset tidak ditemukan. Periksa tautan email Anda.</p><Link to='/forgot-password' className='button'>Kirim ulang</Link></div></div>
  );

  return (
    <div className='container'>
      <div className='card form-card' style={{maxWidth:520,margin:'24px auto'}}>
        <h2>Reset Password</h2>
        <form onSubmit={submit}>
          <label>Password Baru</label>
          <div className='password-field'>
            <input value={password} onChange={e=> setPassword(e.target.value)} type={showPass? 'text':'password'} />
            <button type='button' onClick={()=> setShowPass(s=>!s)} className='password-toggle' aria-label={showPass? 'Sembunyikan password':'Tampilkan password'}>
              <img src={showPass? '/assets/hide.png':'/assets/view.png'} alt={showPass? 'Sembunyikan':'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>
          <label>Konfirmasi Password</label>
          <div className='password-field'>
            <input value={confirm} onChange={e=> setConfirm(e.target.value)} type={showConfirm? 'text':'password'} />
            <button type='button' onClick={()=> setShowConfirm(s=>!s)} className='password-toggle' aria-label={showConfirm? 'Sembunyikan password':'Tampilkan password'}>
              <img src={showConfirm? '/assets/hide.png':'/assets/view.png'} alt={showConfirm? 'Sembunyikan':'Tampilkan'} className='password-toggle-icon' />
            </button>
          </div>
          <div style={{marginTop:12}}>
            <button className='button' disabled={loading}>{loading? 'Memproses...':'Reset Password'}</button>
          </div>
        </form>
        {status && <div style={{marginTop:12}} className='muted'>{status}</div>}
      </div>
    </div>
  );
}
