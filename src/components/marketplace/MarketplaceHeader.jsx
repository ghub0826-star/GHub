import React from 'react';
import { Link } from 'react-router-dom';

export default function MarketplaceHeader(){
  return (
    <div className='marketplace-header'>
      <nav className='breadcrumb'>
        <Link to='/'>Home</Link>
        <span> / </span>
        <span>Marketplace</span>
      </nav>
      <h1>Marketplace Game</h1>
      <p className='muted'>Temukan item, akun, currency, top up, dan layanan game dari seller terpercaya.</p>
    </div>
  );
}
