import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer(){
  return (
    <footer className='footer'>
      <div className='footer-top'>
        <div className='footer-brand'>
          <h3>GHub</h3>
          <p>Marketplace game aman dan terpercaya</p>
        </div>
        <div className='footer-links'>
          <div>
            <h4>Marketplace</h4>
            <ul>
              <li><Link to='/marketplace'>Semua Game</Link></li>
              <li><Link to='/marketplace'>Item</Link></li>
              <li><Link to='/marketplace'>Akun</Link></li>
              <li><Link to='/marketplace'>Top Up</Link></li>
            </ul>
          </div>
          <div>
            <h4>Bantuan</h4>
            <ul>
              <li><Link to='/help'>Pusat Bantuan</Link></li>
              <li><Link to='/help'>Cara Beli</Link></li>
              <li><Link to='/help'>Refund</Link></li>
              <li><Link to='/help'>Keamanan</Link></li>
            </ul>
          </div>
          <div>
            <h4>Perusahaan</h4>
            <ul>
              <li><Link to='/'>Tentang GHub</Link></li>
              <li><Link to='/career'>Karier</Link></li>
              <li><Link to='/contact'>Kontak</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className='footer-social'>
        <Link to='/'>Instagram</Link>
        <Link to='/'>Discord</Link>
        <Link to='/'>Facebook</Link>
        <Link to='/'>TikTok</Link>
      </div>
      <div className='footer-copy'>© 2026 GHub. All rights reserved.</div>
    </footer>
  );
}
