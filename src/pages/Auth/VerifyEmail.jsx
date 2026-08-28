import React, { useState } from 'react';
import { verifyEmail } from '../../services/authService';
import { useSearchParams } from 'react-router-dom';

export default function VerifyEmail(){
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState(null);

  const submit = async ()=>{
    try{
      if (!token) return setStatus('Fitur verifikasi email sedang dalam pengembangan.');
      await verifyEmail(token);
      setStatus('Email berhasil diverifikasi. Silakan login.');
    }catch(e){
      setStatus('Gagal memverifikasi.');
    }
  };

  return (
    <div className='container'>
      <div className='card' style={{maxWidth:640,margin:'24px auto'}}>
        <h2>Verifikasi Email</h2>
        <p style={{color:'var(--muted)'}}>Jika verifikasi email tersedia, klik tombol di bawah ini.</p>
        <div style={{display:'flex',gap:8}}>
          <button className='button' onClick={submit}>Verifikasi</button>
        </div>
        {status && <div style={{marginTop:12}} className='muted'>{status}</div>}
      </div>
    </div>
  );
}
