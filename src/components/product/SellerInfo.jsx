import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SellerInfo({ seller }){
  const navigate = useNavigate();
  if (!seller) return null;
  return (
    <div className='card seller-info' style={{marginTop:12}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:56,height:56,borderRadius:8,background:'#111',display:'flex',alignItems:'center',justifyContent:'center'}}>{seller.name[0]}</div>
        <div>
          <div style={{fontWeight:800}}>{seller.name} {seller.verified && <span className='verified'>✓</span>}</div>
          <div style={{color:'var(--muted)'}}>Rating: {seller.rating || '—'} • Respons cepat</div>
        </div>
      </div>
      <div style={{marginTop:12,display:'flex',gap:8}}>
        <Link to={`/seller/${seller.slug}`} className='button'>Lihat Toko</Link>
        <button className='button' onClick={()=> navigate(`/messages?seller=${seller.slug}`)}>Chat Seller</button>
      </div>
    </div>
  );
}
