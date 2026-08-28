import React, { useEffect, useState } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import * as fulfillmentService from '../../services/orderFulfillmentService';
import { Link } from 'react-router-dom';

export default function BuyerDisputes(){
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    fulfillmentService.getMyDisputes().then((res)=>{
      if (mounted) setDisputes(res.data.disputes || []);
    }).catch(()=>{}).finally(()=>{ if (mounted) setLoading(false); });
    return ()=>{ mounted=false; };
  },[]);

  return (
    <BuyerLayout>
      <div>
        <h1>Dispute Saya</h1>
        <p className='muted'>Pantau status dispute yang kamu ajukan.</p>
        {loading ? <div className='card'>Memuat dispute...</div> : (
          <div style={{display:'grid',gap:8}}>
            {disputes.length === 0 && <div className='card'>Belum ada dispute.</div>}
            {disputes.map((d)=>(
              <div key={d.id} className='card' style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div><strong>#{d.dispute_number}</strong></div>
                  <div className='muted'>Order: {d.order_number}</div>
                  <div className='muted'>Alasan: {d.reason}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className='badge'>{d.status}</div>
                  <div style={{marginTop:8}}>
                    <Link to={`/order/${d.order_number}`} className='button small'>Lihat Order</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
