import React from 'react';
import { Link } from 'react-router-dom';

export default function BuyerSidebar(){
  return (
    <div style={{padding:12}}>
      <nav style={{display:'flex',flexDirection:'column',gap:6}}>
        <Link to='/buyer/dashboard' className='nav-link'>Dashboard</Link>
        <Link to='/buyer/orders' className='nav-link'>Pesanan</Link>
        <Link to='/buyer/wishlist' className='nav-link'>Wishlist</Link>
        <Link to='/buyer/messages' className='nav-link'>Pesan</Link>
        <Link to='/buyer/notifications' className='nav-link'>Notifikasi</Link>
        <Link to='/buyer/profile' className='nav-link'>Profil</Link>
        <Link to='/buyer/settings' className='nav-link'>Pengaturan</Link>
      </nav>
    </div>
  );
}
