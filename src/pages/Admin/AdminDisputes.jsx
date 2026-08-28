import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import * as fulfillmentService from '../../services/orderFulfillmentService';
import AdminDisputePanel from '../../components/dispute/AdminDisputePanel';
import formatCurrency from '../../utils/formatCurrency';

export default function AdminDisputes(){
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async ()=>{
    const res = await fulfillmentService.adminGetDisputes();
    setDisputes(res.data.disputes || []);
  };

  useEffect(()=>{
    let mounted = true;
    load().catch(()=>{}).finally(()=>{ if (mounted) setLoading(false); });
    return ()=>{ mounted=false; };
  },[]);

  const handleResolve = async (decision, reason, refundAmount)=>{
    if (!selected) return;
    setActionLoading(true);
    try{
      await fulfillmentService.adminResolveDispute(selected.id, { decision, reason, refundAmount });
      await load();
      setSelected(null);
    }catch(e){ alert(e.response?.data?.message || 'Gagal menyelesaikan dispute'); }
    finally{ setActionLoading(false); }
  };

  const handleRequestInfo = async ()=>{
    if (!selected) return;
    setActionLoading(true);
    try{
      await fulfillmentService.adminRequestInfo(selected.id);
      await load();
    }catch(e){ alert(e.response?.data?.message || 'Gagal meminta info'); }
    finally{ setActionLoading(false); }
  };

  const handleExecuteRefund = async ()=>{
    if (!selected) return;
    setActionLoading(true);
    try{
      // Find the refund for this dispute
      await fulfillmentService.adminExecuteRefund(selected.id);
      await load();
    }catch(e){ alert(e.response?.data?.message || 'Gagal eksekusi refund'); }
    finally{ setActionLoading(false); }
  };

  return (
    <div className='container'>
      <Header />
      <div style={{marginTop:12}} />
      <h1>Manajemen Dispute</h1>
      {loading ? <div className='card'>Memuat dispute...</div> : (
        <div style={{display:'grid',gap:8}}>
          {disputes.length === 0 && <div className='card'>Belum ada dispute.</div>}
          {disputes.map((d)=>(
            <div key={d.id} className='card' style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div><strong>#{d.dispute_number}</strong> — {d.reason}</div>
                <div className='muted'>Order: {d.order_number} • Status: {d.status}</div>
                <div className='muted'>Total: {formatCurrency(d.total_amount)}</div>
              </div>
              <button className='button small' onClick={()=> setSelected(d)}>Kelola</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <AdminDisputePanel
          dispute={selected}
          onResolve={handleResolve}
          onRequestInfo={handleRequestInfo}
          onExecuteRefund={handleExecuteRefund}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}
