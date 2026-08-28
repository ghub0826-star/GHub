import React, { useState } from 'react';
import ProductReviews from './ProductReviews';

export default function ProductTabs({ product }){
  const [tab, setTab] = useState('desc');
  return (
    <div className='card product-tabs' style={{marginTop:12}}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className={tab==='desc'? 'active':''} onClick={()=> setTab('desc')}>Deskripsi</button>
        <button className={tab==='how'? 'active':''} onClick={()=> setTab('how')}>Cara Pembelian</button>
        <button className={tab==='terms'? 'active':''} onClick={()=> setTab('terms')}>Ketentuan</button>
        <button className={tab==='reviews'? 'active':''} onClick={()=> setTab('reviews')}>Review</button>
      </div>
      <div style={{marginTop:12}}>
        {tab==='desc' && <div><h4>Deskripsi</h4><p>{product.description}</p></div>}
        {tab==='how' && <div><h4>Cara Pembelian</h4><p>1. Pilih variasi 2. Masukkan jumlah 3. Bayar melalui checkout.</p></div>}
        {tab==='terms' && <div><h4>Ketentuan</h4><p>Produk digital tidak dapat ditukar kecuali ada kesepakatan.</p></div>}
        {tab==='reviews' && <ProductReviews product={product} />}
      </div>
    </div>
  );
}
