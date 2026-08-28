import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized(){
  const navigate = useNavigate();
  return (
    <div className='container'>
      <div className='card'>
        <h1>403 — Anda tidak memiliki akses ke halaman ini.</h1>
        <p>Anda tidak memiliki izin untuk melihat halaman yang diminta.</p>
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <button className='button' onClick={() => navigate(-1)}>Kembali</button>
          <button className='button primary' onClick={() => navigate('/account')}>Kembali ke Dashboard</button>
        </div>
      </div>
    </div>
  );
}
