import React, { useState } from 'react';

export default function ProductGallery({ images = [] }){
  const imgs = images && images.length ? images : ['/assets/placeholder.png'];
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(null);

  const next = ()=> setIdx(i=> (i+1)%imgs.length);
  const prev = ()=> setIdx(i=> (i-1+imgs.length)%imgs.length);

  return (
    <div className='product-gallery card'>
      <div className='main-image' style={{position:'relative'}}>
        <img src={imgs[idx]} alt={`produk-${idx}`} onError={(e)=> e.currentTarget.src='/assets/placeholder.png'} style={{width:'100%',height:400,objectFit:'cover',borderRadius:8}} onClick={()=> setZoom(imgs[idx])} />
        <button className='button' style={{position:'absolute',left:8,top:8}} onClick={prev}>Prev</button>
        <button className='button' style={{position:'absolute',right:8,top:8}} onClick={next}>Next</button>
      </div>
      <div className='thumbs' style={{display:'flex',gap:8,marginTop:8,overflowX:'auto'}}>
        {imgs.map((s,i)=> (
          <img key={s+i} src={s} alt={'thumb-'+i} onError={(e)=> e.currentTarget.src='/assets/placeholder.png'} style={{width:80,height:60,objectFit:'cover',borderRadius:6,cursor:'pointer',border: i===idx? '2px solid var(--primary)':'2px solid transparent'}} onClick={()=> setIdx(i)} />
        ))}
      </div>

      {zoom && (
        <div className='zoom-overlay' onClick={()=> setZoom(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <img src={zoom} alt='zoom' style={{maxWidth:'90%',maxHeight:'90%'}} onError={(e)=> e.currentTarget.src='/assets/placeholder.png'} />
        </div>
      )}
    </div>
  );
}
