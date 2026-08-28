import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const seller = product.seller || {};
  return (
    <Link to={`/product/${product.slug || product.id}`} className='product-card'>
      <img src={product.image || `https://picsum.photos/seed/product${product.id}/400/200`} alt={product.title} />
      <h4 style={{margin:'8px 0 4px'}}>{product.title}</h4>
      <div style={{color:'var(--muted)',fontSize:13}}>⚡ {product.delivery} • ⭐ {product.rating} ({product.reviews})</div>
      <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:700}}>Rp {Number(product.price).toLocaleString()}</div>
        <div style={{textAlign:'right',fontSize:12,color:'var(--muted)'}}>
          {seller.name || 'Seller'} {seller.verified && <span aria-label='Verified seller'>✓</span>}
        </div>
      </div>
    </Link>
  );
}
