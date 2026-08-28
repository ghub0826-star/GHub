import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

const KYC_BADGE = {
  PENDING:  { text: 'Pending',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  VERIFIED: { text: 'Terverifikasi', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  REJECTED: { text: 'Ditolak',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
};

function KycBadge({ status }) {
  const b = KYC_BADGE[status] || { text: status || '—', color:'#64748b', bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.2)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', background:b.bg, border:`1px solid ${b.border}`, color:b.color }}>
      <i className={`fa-solid fa-circle`} style={{ fontSize:'0.38rem' }} />{b.text}
    </span>
  );
}

function ImgModal({ src, onClose }) {
  if (!src) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <img src={src} alt='Document' style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:12, boxShadow:'0 24px 80px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()} />
      <button onClick={onClose} style={{ position:'absolute', top:20, right:24, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:'1rem' }}>
        <i className='fa-solid fa-xmark' />
      </button>
    </div>
  );
}

export default function SuperAdminKycReview() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('PENDING');
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null); // detail object
  const [imgSrc,    setImgSrc]    = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [msg,       setMsg]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter && filter !== 'ALL') params.status = filter;
      if (search) params.search = search;
      const r = await api.get('/admin/kyc', { params });
      setItems(r.data?.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (row) => {
    try {
      const r = await api.get(`/admin/kyc/${row.seller_id}`);
      setSelected(r.data?.data || row);
      setShowReject(false); setRejectReason(''); setMsg(null);
    } catch {
      setSelected(row);
    }
  };

  const approve = async () => {
    if (!selected) return;
    setBusy(true); setMsg(null);
    try {
      await api.post(`/admin/kyc/${selected.seller_id}/approve`);
      setMsg({ type:'success', text:'Identitas seller berhasil diverifikasi.' });
      load();
      setSelected(prev => ({ ...prev, identity_verified: true, status: 'APPROVED' }));
    } catch (e) {
      setMsg({ type:'error', text: e?.response?.data?.message || 'Gagal menyetujui.' });
    } finally { setBusy(false); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { setMsg({ type:'error', text:'Alasan penolakan wajib diisi.' }); return; }
    setBusy(true); setMsg(null);
    try {
      await api.post(`/admin/kyc/${selected.seller_id}/reject`, { reason: rejectReason.trim() });
      setMsg({ type:'success', text:'Verifikasi ditolak.' });
      load();
      setSelected(prev => ({ ...prev, identity_verified: false, status: 'REJECTED', rejection_reason: rejectReason }));
      setShowReject(false); setRejectReason('');
    } catch (e) {
      setMsg({ type:'error', text: e?.response?.data?.message || 'Gagal menolak.' });
    } finally { setBusy(false); }
  };

  const pendingCount = items.filter(i => !i.identity_verified && i.status !== 'REJECTED').length;

  return (
    <AdminLayout title='KYC Seller' subtitle='Periksa dan verifikasi identitas seller (KTP + selfie).'>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Disubmit', value: items.length,                                           color:'#22d3ee' },
          { label:'Menunggu',       value: pendingCount,                                            color:'#f59e0b' },
          { label:'Terverifikasi',  value: items.filter(i => i.identity_verified).length,           color:'#10b981' },
          { label:'Ditolak',        value: items.filter(i => i.status === 'REJECTED').length,       color:'#ef4444' },
        ].map(s => (
          <div key={s.label} className='card' style={{ padding:'13px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.76rem', color:'#64748b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:14 }}>
        <input className='admin-search' placeholder='Cari nama atau email...' value={search} onChange={e => setSearch(e.target.value)} style={{ flex:'1 1 180px', maxWidth:280 }} />
        <select className='admin-select' value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth:140 }}>
          <option value='ALL'>Semua</option>
          <option value='PENDING'>Menunggu</option>
          <option value='APPROVED'>Disetujui</option>
          <option value='REJECTED'>Ditolak</option>
        </select>
        <button className='button small' style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8' }} onClick={load}>
          <i className='fa-solid fa-rotate-right' /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className='card' style={{ padding:0, overflow:'hidden' }}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Email</th>
                <th>Dikirim</th>
                <th style={{ textAlign:'center' }}>KYC Status</th>
                <th style={{ textAlign:'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'#64748b' }}><i className='fa-solid fa-spinner fa-spin' style={{ marginRight:8 }} />Memuat...</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'#64748b' }}>Tidak ada data verifikasi.</td></tr>}
              {!loading && items.map(row => {
                const displayStatus = row.identity_verified ? 'VERIFIED' : row.status === 'REJECTED' ? 'REJECTED' : 'PENDING';
                return (
                  <tr key={row.seller_id}>
                    <td>
                      <div style={{ fontWeight:600, color:'#f7f8ff' }}>{row.full_name}</div>
                      <div style={{ fontSize:'0.75rem', color:'#64748b' }}>ID #{row.seller_id}</div>
                    </td>
                    <td style={{ fontSize:'0.83rem' }}>{row.email}</td>
                    <td style={{ fontSize:'0.8rem', color:'#64748b' }}>{fmtDate(row.submitted_at)}</td>
                    <td style={{ textAlign:'center' }}><KycBadge status={displayStatus} /></td>
                    <td style={{ textAlign:'center' }}>
                      <button
                        onClick={() => openDetail(row)}
                        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8' }}
                      >
                        <i className='fa-solid fa-eye' /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:500, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'40px 16px', backdropFilter:'blur(3px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{ width:'min(560px,96vw)', background:'#0d0f1e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:28, boxShadow:'0 24px 80px rgba(0,0,0,0.7)', margin:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
              <div>
                <h3 style={{ margin:0, color:'#f7f8ff', fontSize:'1.05rem' }}>
                  <i className='fa-solid fa-id-card' style={{ marginRight:8, color:'#22d3ee' }} />Review KYC Seller
                </h3>
                <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:'0.82rem' }}>{selected.full_name} · {selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'1.1rem' }}><i className='fa-solid fa-xmark' /></button>
            </div>

            {msg && (
              <div style={{ padding:'9px 14px', borderRadius:8, marginBottom:14, fontSize:'0.82rem', fontWeight:600, background: msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', color: msg.type==='success'?'#10b981':'#ef4444', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}` }}>
                <i className={`fa-solid ${msg.type==='success'?'fa-circle-check':'fa-circle-exclamation'}`} style={{ marginRight:7 }} />{msg.text}
              </div>
            )}

            {/* Info */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[['Status',     selected.identity_verified ? 'VERIFIED' : (selected.status || '—')],
                ['Dikirim',    fmtDate(selected.submitted_at)],
                ['Diulas',     fmtDate(selected.reviewed_at)],
                ['Reviewer',   selected.reviewer_name || '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'9px 12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:'0.72rem', color:'#64748b', marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:'0.85rem', color:'#e2e8f0', fontWeight:600 }}>{String(v)}</div>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[
                { label:'Foto KTP', url: selected.ktp_url },
                { label:'Foto Selfie', url: selected.selfie_url },
              ].map(doc => (
                <div key={doc.label}>
                  <div style={{ fontSize:'0.78rem', color:'#94a3b8', fontWeight:600, marginBottom:6 }}>{doc.label}</div>
                  {doc.url ? (
                    <div onClick={() => setImgSrc(doc.url)} style={{ cursor:'pointer', borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <img src={doc.url} alt={doc.label} style={{ width:'100%', maxHeight:140, objectFit:'cover', display:'block' }} />
                      <div style={{ padding:'6px 10px', fontSize:'0.72rem', color:'#64748b', textAlign:'center' }}>
                        <i className='fa-solid fa-magnifying-glass' style={{ marginRight:5 }} />Klik untuk perbesar
                      </div>
                    </div>
                  ) : (
                    <div style={{ height:100, borderRadius:10, border:'1px dashed rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#475569', fontSize:'0.78rem' }}>
                      Tidak tersedia
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rejection reason if rejected */}
            {selected.status === 'REJECTED' && selected.rejection_reason && (
              <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:16, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:'0.82rem' }}>
                <strong>Alasan penolakan:</strong> {selected.rejection_reason}
              </div>
            )}

            {/* Actions */}
            {!selected.identity_verified && selected.status !== 'REJECTED' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', gap:10 }}>
                  <button
                    disabled={busy}
                    onClick={approve}
                    style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:'0.875rem', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981' }}
                  >
                    <i className='fa-solid fa-circle-check' /> Setujui
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setShowReject(v => !v)}
                    style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:'0.875rem', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444' }}
                  >
                    <i className='fa-solid fa-circle-xmark' /> Tolak
                  </button>
                </div>
                {showReject && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <textarea
                      className='admin-search'
                      rows={3}
                      placeholder='Masukkan alasan penolakan (wajib)...'
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      style={{ resize:'vertical' }}
                    />
                    <button
                      disabled={busy || !rejectReason.trim()}
                      onClick={reject}
                      style={{ padding:'9px 20px', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:'0.85rem', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', opacity: !rejectReason.trim() ? 0.5 : 1 }}
                    >
                      {busy ? <><i className='fa-solid fa-spinner fa-spin' style={{ marginRight:6 }} />Memproses...</> : 'Konfirmasi Penolakan'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {selected.identity_verified && (
              <div style={{ textAlign:'center', padding:'14px 0', color:'#10b981', fontWeight:700 }}>
                <i className='fa-solid fa-shield-check' style={{ marginRight:8 }} />Identitas telah diverifikasi
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image lightbox */}
      <ImgModal src={imgSrc} onClose={() => setImgSrc(null)} />
    </AdminLayout>
  );
}
