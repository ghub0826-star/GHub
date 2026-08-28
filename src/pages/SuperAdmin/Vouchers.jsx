import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtIDR  = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(Number(n||0));

const EMPTY = { code:'', name:'', type:'PERCENT', value:'', max_discount:'', min_transaction:'0', usage_limit:'', start_date:'', end_date:'', is_active:true };

export default function SuperAdminVouchers() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null); // null = tutup, {...} = buka
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/vouchers');
      setItems(r.data?.vouchers || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form?.code || !form?.value) { setMsg({type:'error',text:'Kode dan nilai wajib diisi.'}); return; }
    setSaving(true); setMsg(null);
    try {
      const payload = { ...form, value: Number(form.value), min_transaction: Number(form.min_transaction||0) };
      if (form.id) await api.patch(`/admin/vouchers/${form.id}`, payload);
      else         await api.post('/admin/vouchers', payload);
      setMsg({type:'success',text:`Voucher berhasil ${form.id?'diperbarui':'dibuat'}.`});
      setForm(null);
      load();
    } catch(e) {
      setMsg({type:'error',text: e?.response?.data?.message || 'Gagal menyimpan voucher.'});
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title='Voucher & Promo' subtitle='Buat dan kelola kode voucher diskon untuk pembeli.'>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button className='button small' style={{background:'rgba(139,92,246,0.2)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.35)',padding:'8px 18px',fontWeight:700}}
          onClick={()=>setForm({...EMPTY})}>
          <i className='fa-solid fa-plus' style={{marginRight:8}}/>Buat Voucher
        </button>
      </div>

      {msg && (
        <div style={{padding:'10px 16px',borderRadius:10,marginBottom:16,fontWeight:600,fontSize:'0.875rem',
          background:msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',
          border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`,
          color:msg.type==='success'?'#10b981':'#ef4444'}}>
          <i className={`fa-solid ${msg.type==='success'?'fa-circle-check':'fa-circle-exclamation'}`} style={{marginRight:8}}/>{msg.text}
        </div>
      )}

      {/* Form modal */}
      {form && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(3px)'}}
          onClick={e=>{if(e.target===e.currentTarget)setForm(null);}}>
          <div style={{width:'min(520px,95vw)',background:'#0d0f1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:28,boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}}>
            <h3 style={{margin:'0 0 18px',color:'#f7f8ff',fontSize:'1.05rem'}}>{form.id?'Edit Voucher':'Buat Voucher Baru'}</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                {label:'Kode *',           key:'code',            type:'text',  span:1},
                {label:'Nama',             key:'name',            type:'text',  span:1},
                {label:'Tipe',             key:'type',            type:'select',span:1, opts:['PERCENT','FIXED']},
                {label:'Nilai *',          key:'value',           type:'number',span:1},
                {label:'Maks. Diskon',     key:'max_discount',    type:'number',span:1},
                {label:'Min. Transaksi',   key:'min_transaction', type:'number',span:1},
                {label:'Batas Penggunaan', key:'usage_limit',     type:'number',span:1},
                {label:'Mulai',            key:'start_date',      type:'date',  span:1},
                {label:'Berakhir',         key:'end_date',        type:'date',  span:1},
              ].map(f=>(
                <div key={f.key} style={{gridColumn:`span ${f.span}`}}>
                  <label style={{display:'block',fontSize:'0.78rem',fontWeight:600,color:'#94a3b8',marginBottom:4}}>{f.label}</label>
                  {f.type==='select' ? (
                    <select className='admin-select' style={{width:'100%'}} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}>
                      {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className='admin-search' type={f.type} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                  )}
                </div>
              ))}
              <div style={{gridColumn:'span 2',display:'flex',alignItems:'center',gap:10}}>
                <input type='checkbox' id='v-active' checked={!!form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))} style={{width:16,height:16}}/>
                <label htmlFor='v-active' style={{color:'#e2e8f0',fontSize:'0.875rem',cursor:'pointer'}}>Aktif</label>
              </div>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
              <button className='button small' onClick={()=>setForm(null)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8'}}>Batal</button>
              <button className='button small' disabled={saving} onClick={save}
                style={{background:'rgba(139,92,246,0.2)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.35)'}}>
                {saving?'Menyimpan…':'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='card' style={{padding:0,overflow:'hidden'}}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Nilai</th><th>Penggunaan</th><th>Berlaku</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{textAlign:'center',padding:32,color:'#64748b'}}>Memuat...</td></tr>}
              {!loading && items.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:32,color:'#64748b'}}>Belum ada voucher.</td></tr>}
              {!loading && items.map(v=>(
                <tr key={v.id}>
                  <td style={{fontWeight:700,color:'#a78bfa',fontFamily:'monospace'}}>{v.code}</td>
                  <td style={{color:'#e2e8f0'}}>{v.name||'—'}</td>
                  <td><span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:6,background:'rgba(139,92,246,0.1)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.2)'}}>{v.type}</span></td>
                  <td style={{fontWeight:700,color:'#10b981'}}>{v.type==='PERCENT'?`${v.value}%`:fmtIDR(v.value)}</td>
                  <td style={{textAlign:'center'}}>{Number(v.used_count||v.usage_count||0)}{v.usage_limit?` / ${v.usage_limit}`:''}</td>
                  <td style={{fontSize:'0.78rem',color:'#64748b'}}>{fmtDate(v.start_date)} – {fmtDate(v.end_date)}</td>
                  <td>
                    <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:20,fontWeight:700,
                      background:v.is_active?'rgba(16,185,129,0.1)':'rgba(100,116,139,0.1)',
                      color:v.is_active?'#10b981':'#64748b',
                      border:`1px solid ${v.is_active?'rgba(16,185,129,0.25)':'rgba(100,116,139,0.2)'}`}}>
                      {v.is_active?'Aktif':'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <button className='button small' style={{minHeight:28,padding:'0 10px',fontSize:'0.75rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8'}}
                      onClick={()=>setForm({...v,value:String(v.value),min_transaction:String(v.min_transaction||0),max_discount:String(v.max_discount||''),usage_limit:String(v.usage_limit||'')})}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
