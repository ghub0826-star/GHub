import React, { useState } from 'react';
import { forgotPassword } from '../../services/authService';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    setLoading(true);
    try{
      await forgotPassword(email);
      setStatus('Jika email terdaftar, instruksi reset akan dikirim.');
    }catch(e){
      setStatus('Gagal menghubungi server. Coba lagi nanti.');
    }finally{ setLoading(false); }
  };

  return (
    <div className='container'>
      <div className='card form-card' style={{maxWidth:520,margin:'24px auto'}}>
        <h2>Lupa Password</h2>
        <p style={{color:'var(--muted)'}}>Masukkan email Anda untuk menerima instruksi reset.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e=> setEmail(e.target.value)} type='email' />
          <div style={{marginTop:12}}>
            <button className='button' disabled={loading}>{loading? 'Memproses...':'Kirim Instruksi'}</button>
          </div>
        </form>
        {status && <div style={{marginTop:12}} className='muted'>{status}</div>}
      </div>
    </div>
  );
}
