import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProductReviews({ product }){
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      try{
        const res = await api.get(`/reviews/${product.slug}`);
        if (mounted) setReviews(res.data || []);
      }catch(e){
        if (mounted) setReviews([]);
      }finally{ if (mounted) setLoading(false); }
    };
    if (product) load();
    return ()=> mounted = false;
  },[product]);

  const submit = async ()=>{
    if (!comment.trim()) return;
    const payload = { order_id: 0, buyer_id: 1, seller_id: product.sellerId || product.seller_id, rating, comment };
    try{
      const res = await api.post(`/reviews/${product.slug}`, payload);
      setReviews(prev => [...prev, res.data]);
      setComment(''); setRating(5);
    }catch(e){
      alert('Gagal mengirim review');
    }
  };

  return (
    <div>
      <h4>Ulasan</h4>
      {loading ? <p>Memuat ulasan...</p> : (
        <div>
          {reviews.length === 0 ? <p>Belum ada ulasan untuk produk ini.</p> : (
            <ul className='reviews-list'>
              {reviews.map(r=> (
                <li key={r.id || Math.random()} className='review-item'>
                  <div className='review-head'><strong>{r.rating} ⭐</strong> • <span className='muted'>oleh {r.username || (r.buyer_name || 'Pembeli')}</span></div>
                  <div className='review-body'>{r.comment}</div>
                </li>
              ))}
            </ul>
          )}

          <div style={{marginTop:12}} className='card'>
            <h5>Tulis Ulasan</h5>
            <label>Rating</label>
            <select value={rating} onChange={e=> setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
            <label style={{marginTop:8}}>Komentar</label>
            <textarea value={comment} onChange={e=> setComment(e.target.value)} rows={4} />
            <div style={{marginTop:8}}>
              <button className='button' onClick={submit}>Kirim Ulasan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
