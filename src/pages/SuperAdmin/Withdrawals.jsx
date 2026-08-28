import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmtIDR  = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(Number(n||0));
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '—';

function StatusBadge({ s }) {
  const map = { PENDING:'#f59e0b', APPROVED:'#3b82f6', PROCESSING:'#8b5cf6', PAID:'#10b981', REJECTED:'#ef4444' };
  const c = map[String(s||'').toUpperCase()] || '#64748b';
  return <span style={{display:'inline-block',padding:'2px 9px',borderRadius:20,fontSize:'0.72rem',fontWeight:700,background:`${c}18`,color:c,border:`1px solid ${c}33`,textTransform:'uppercase'}}>{s||'—'}</span>;
}

export default function SuperAdminWithdrawals() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(null);
  const [msg,     setMsg]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/withdrawals');
      const d = r.data;
      setItems(Array.isArray(d) ? d : (d.withdrawals || []));
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const action = async (id, endpoint, label) => {
    setBusy(id);
    setMsg(null);
    try {
      await api.post(`/admin/withdrawals/${id}/${endpoint}`);
      setMsg({ type:'success', text:`${label} berhasil.` });
      load();
    } catch(e) {
      setMsg({ type:'error', text: e?.response?.data?.message || `${label} gagal.` });
    } finally { setBusy(null); }
  };

  const stats = {
    total:      items.length,
    pending:    items.filter(i=>String(i.status||'').toUpperCase()==='PENDING').length,
    processing: items.filter(i=>String(i.status||'').toUpperCase()==='PROCESSING').length,
    totalIDR:   items.filter(i=>String(i.status||'').toUpperCase()==='PENDING').reduce((s,i)=>s+Number(i.amount||0),0),
  };

  return (
    <AdminLayout title='Penarikan Dana' subtitle='Kelola dan proses permintaan withdrawal dari seller.'>
      <div className='admin-stat-grid' style={{marginBottom:24}}>
        {[
          {label:'Total Request', value:stats.total,      color:'#60a5fa'},
          {label:'Menunggu',      value:stats.pending,    color:'#f59e0b'},
          {label:'Diproses',      value:stats.processing, color:'#8b5cf6'},
          {label:'Nilai Pending', value:fmtIDR(stats.totalIDR), color:'#10b981'},
        ].map(s=>(
          <div key={s.label} className='admin-stat-card'>
            <div className='admin-stat-value' style={{color:s.color,fontSize:'1.3rem'}}>{s.value}</div>
            <div className='admin-stat-label'>{s.label}</div>
          </div>
        ))}
      </div>

      {msg && (
        <div style={{padding:'10px 16px',borderRadius:10,marginBottom:16,fontWeight:600,fontSize:'0.875rem',
          background:msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',
          border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`,
          color:msg.type==='success'?'#10b981':'#ef4444',
        }}>
          <i className={`fa-solid ${msg.type==='success'?'fa-circle-check':'fa-circle-exclamation'}`} style={{marginRight:8}}/>{msg.text}
        </div>
      )}

      <div className='card' style={{padding:0,overflow:'hidden'}}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>ID</th><th>Seller</th><th>Rekening</th><th>Jumlah</th><th>Status</th><th>Tanggal</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'#64748b'}}>Memuat...</td></tr>}
              {!loading && items.length===0 && <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'#64748b'}}>Tidak ada request penarikan.</td></tr>}
              {!loading && items.map(item=>{
                const status = String(item.status||'').toUpperCase();
                return (
                  <tr key={item.id}>
                    <td style={{color:'#64748b',fontSize:'0.8rem'}}>#{item.id}</td>
                    <td>
                      <div style={{fontWeight:600,color:'#f7f8ff'}}>{item.seller_name||item.user_name||`Seller #${item.seller_id||item.user_id}`}</div>
                      {item.bank_name && <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:1}}>{item.bank_name}</div>}
                    </td>
                    <td style={{fontSize:'0.82rem'}}>
                      {item.account_number || '—'}
                      {item.account_holder && <div style={{fontSize:'0.75rem',color:'#64748b'}}>{item.account_holder}</div>}
                    </td>
                    <td style={{fontWeight:700,color:'#10b981'}}>{fmtIDR(item.amount)}</td>
                    <td><StatusBadge s={item.status}/></td>
                    <td style={{fontSize:'0.8rem',color:'#64748b'}}>{fmtDate(item.created_at)}</td>
                    <td>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {status==='PENDING' && <>
                          <button className='button small' disabled={!!busy}
                            style={{minHeight:28,padding:'0 10px',fontSize:'0.75rem',background:'rgba(59,130,246,0.15)',color:'#60a5fa',border:'1px solid rgba(59,130,246,0.3)'}}
                            onClick={()=>action(item.id,'approve','Approve')}>Approve</button>
                          <button className='button small' disabled={!!busy}
                            style={{minHeight:28,padding:'0 10px',fontSize:'0.75rem',background:'rgba(239,68,68,0.12)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.3)'}}
                            onClick={()=>action(item.id,'reject','Reject')}>Reject</button>
                        </>}
                        {status==='APPROVED' &&
                          <button className='button small' disabled={!!busy}
                            style={{minHeight:28,padding:'0 10px',fontSize:'0.75rem',background:'rgba(139,92,246,0.15)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.3)'}}
                            onClick={()=>action(item.id,'process','Proses')}>Proses</button>
                        }
                        {status==='PROCESSING' &&
                          <button className='button small' disabled={!!busy}
                            style={{minHeight:28,padding:'0 10px',fontSize:'0.75rem',background:'rgba(16,185,129,0.15)',color:'#10b981',border:'1px solid rgba(16,185,129,0.3)'}}
                            onClick={()=>action(item.id,'mark-paid','Mark Paid')}>Mark Paid</button>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
