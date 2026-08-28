import React, { useEffect, useState } from 'react';
import * as sellerService from '../../services/sellerService';
import { useNavigate, Link } from 'react-router-dom';

export default function SellerPending(){
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    sellerService.getSellerApplication()
      .then(r => {
        if (mounted) setApp(r?.data?.application || null);
      })
      .catch(() => {
        if (mounted) setApp(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  },[]);

  useEffect(()=>{
    if (app && app.status === 'APPROVED'){
      // if application approved, navigate to dashboard
      navigate('/seller/dashboard');
    }
  },[app,navigate]);

  if (loading) {
    return (
      <div className='container'>
        <div className='card'>Memeriksa status pengajuan...</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className='container'>
        <div className='card'>
          <h2>Belum Ada Pengajuan Seller</h2>
          <p className='muted'>Kamu belum mengajukan permohonan menjadi seller di GHub.</p>
          <div style={{marginTop: 16}}>
            <Link to='/seller/register' className='button primary'>Daftar Jadi Seller Sekarang</Link>
          </div>
        </div>
      </div>
    );
  }

  if (app.status === 'PENDING'){
    return (
      <div className='container'>
        <div className='card'>
          <h2>Pengajuan Seller Sedang Ditinjau</h2>
          <p>Tim GHub sedang memeriksa data toko kamu.</p>
        </div>
      </div>
    );
  }

  if (app.status === 'REJECTED'){
    return (
      <div className='container'>
        <div className='card'>
          <h2>Pengajuan Seller Belum Disetujui</h2>
          <p>Alasan: {app.reason || 'Tidak tersedia'}</p>
          <button className='button' onClick={()=> window.location.href = '/seller/register'}>Perbaiki Pengajuan</button>
        </div>
      </div>
    );
  }

  if (app.status === 'SUSPENDED'){
    return (
      <div className='container'>
        <div className='card'>
          <h2>Akun Seller Dinonaktifkan</h2>
          <p>Alasan: {app.reason || 'Tidak tersedia'}</p>
          <button className='button' onClick={()=> window.location.href = '/help'}>Hubungi Bantuan</button>
        </div>
      </div>
    );
  }

  return <div className='container'><div className='card'>Status: {app.status}</div></div>;
}
