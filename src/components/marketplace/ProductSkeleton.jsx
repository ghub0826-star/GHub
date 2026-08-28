import React from 'react';

export default function ProductSkeleton(){
  return (
    <div className='product-card skeleton'>
      <div className='thumb' />
      <div className='meta'>
        <div className='line short' />
        <div className='line' />
        <div className='line' />
      </div>
    </div>
  );
}
