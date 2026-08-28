import React from 'react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import EmptyProducts from './EmptyProducts';

export default function ProductGrid({ products, loading }){
  if (loading){
    return (
      <div className='product-grid'>
        {Array.from({length:8}).map((_,i)=> <ProductSkeleton key={i} />)}
      </div>
    );
  }
  if (!products || products.length === 0) return <EmptyProducts />;
  return (
    <div className='product-grid'>
      {products.map(p=> <ProductCard product={p} key={p.id} />)}
    </div>
  );
}
