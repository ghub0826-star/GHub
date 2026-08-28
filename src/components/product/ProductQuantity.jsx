import React from 'react';

export default function ProductQuantity({ quantity, setQuantity, max = 9999, price }){
  const dec = ()=> setQuantity(q => Math.max(1, q-1));
  const inc = ()=> setQuantity(q => Math.min(max, q+1));
  return (
    <div className='product-quantity' style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
      <button className='button' onClick={dec} disabled={quantity<=1}>-</button>
      <input type='number' value={quantity} onChange={e=> setQuantity(Math.max(1, Math.min(max, Number(e.target.value)||1)))} style={{width:64,textAlign:'center'}} />
      <button className='button' onClick={inc} disabled={quantity>=max}>+</button>
      <div style={{marginLeft:12}}>Total: <strong>{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format((price||0)*quantity)}</strong></div>
    </div>
  );
}
