import React from 'react';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

export default function ProductCard({ product }){
  return (
    <Link to={`/product/${product.slug}`} className='product-card' aria-label={product.title}>
      <div className='thumb'>
        <img src={product.image} alt={product.title} />
        {product.deliveryType === 'instant' && <span className='badge instant'>Instant</span>}
      </div>
      <div className='meta'>
        <h4 className='title'>{product.title}</h4>
        <div className='sub'>{product.game} • {product.sellerName} {product.sellerVerified && <span className='verified'>✓</span>}</div>
        <div className='price'>{formatCurrency(product.price)}</div>
        <div className='stats'>⭐ {product.rating} ({product.reviewCount}) • {product.totalSales} sales</div>
        <div className='delivery'>Est. {product.deliveryTime}</div>
      </div>
    </Link>
  );
}
