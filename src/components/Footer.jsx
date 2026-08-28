import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className='footer'>
      <div className='footer-top'>
        <div className='footer-brand'>
          <h3>GHub</h3>
          <p>Marketplace game profesional untuk beli dan jual digital goods dengan aman.</p>
        </div>
        <div className='footer-links'>
          <div>
            <h4>Marketplace</h4>
            <ul>
              <li><Link to='/marketplace?category=games'>Games</Link></li>
              <li><Link to='/marketplace?category=currency'>Game Currency</Link></li>
              <li><Link to='/marketplace?category=accounts'>Accounts</Link></li>
              <li><Link to='/marketplace?category=skins'>Skins</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><Link to='/help'>Help Center</Link></li>
              <li><Link to='/help'>Orders</Link></li>
              <li><Link to='/help'>Security</Link></li>
              <li><Link to='/refund-policy'>Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to='/'>About GHub</Link></li>
              <li><Link to='/'>Partners</Link></li>
              <li><Link to='/'>Careers</Link></li>
              <li><Link to='/'>Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal links */}
      <div className='footer-legal'>
        <Link to='/terms'>Syarat &amp; Ketentuan</Link>
        <Link to='/privacy'>Kebijakan Privasi</Link>
        <Link to='/refund-policy'>Kebijakan Refund</Link>
        <Link to='/seller-agreement'>Perjanjian Seller</Link>
        <Link to='/buyer-protection'>Perlindungan Pembeli</Link>
        <Link to='/prohibited-products'>Produk Terlarang</Link>
        <Link to='/payment-policy'>Kebijakan Pembayaran</Link>
        <Link to='/dispute-resolution'>Penyelesaian Sengketa</Link>
        <Link to='/community-guidelines'>Pedoman Komunitas</Link>
      </div>

      <div className='footer-social'>
        <Link to='/'>Instagram</Link>
        <Link to='/'>Discord</Link>
        <Link to='/'>Facebook</Link>
        <Link to='/'>Twitter</Link>
      </div>
      <div className='footer-copy'>© 2026 GHub. All rights reserved.</div>
    </footer>
  );
}
