import React from 'react';
import SellerSidebar from '../components/seller/SellerSidebar';
import '../styles/seller.css';

export default function SellerLayout({ children }){
  return (
    <div className='seller-layout'>
      <SellerSidebar />
      <main className='seller-main'>
        {children}
      </main>
    </div>
  );
}
