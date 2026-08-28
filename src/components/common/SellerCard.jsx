import React from 'react';

export default function SellerCard({ seller }) {
  return (
    <div className='seller-card'>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className='logo'>{seller.name.slice(0,1)}</div>
        <div>
          <strong>{seller.name} {seller.verified && <span style={{color:'var(--accent)'}}>✓</span>}</strong>
          <div className='seller-meta'>⭐ {seller.rating} ({seller.reviews}) • {seller.sales} Sales • Respons {seller.response}</div>
        </div>
      </div>
    </div>
  );
}
