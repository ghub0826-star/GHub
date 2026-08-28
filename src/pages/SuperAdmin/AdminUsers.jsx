import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

/* Halaman Kelola Admin — SUPER_ADMIN only */
/* Backend: GET /admin/admin-users, POST /admin/admin-users */
/* Berbeda dengan AdminUsers.jsx (buyer management) */

const ROLES = [
  { code:'ADMIN',         label:'Admin',          desc:'Akses operasional penuh (kecuali settings & finance).' },
  { code:'SUPPORT_ADMIN', label:'Support Admin',  desc:'Kelola tiket, disputes, dan pesan pengguna.' },
  { code:'FINANCE_ADMIN', label:'Finance Admin',  desc:'Kelola withdrawal, pembayaran, dan laporan keuangan.' },
  { code:'MODERATOR',     label:'Moderator',      desc:'Review dan moderasi produk serta konten.' },
];

export default function SuperAdminAdminUsers() {
  const [admins,  setAdmins]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null); // { userId:'', adminRoleCode:'' }
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/admin-users');
      setAdmins(r.data?.adminUsers || []);
    } catch { setAdmins([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form?.userId || !form?.adminRoleCode) {
      setMsg({type:'error', text:'User ID dan role wajib diisi.'}); return;
    }
    setSaving(true); setMsg(null);
    try {
      await api.post('/admin/admin-users', { userId: Number(form.userId), adminRoleCode: form.adminRoleCode });
      setMsg({type:'success', text:'Role admin berhasil ditugaskan.'});
      setForm(null);
      load();
    } catch(e) {
      setMsg({type:'error', text: e?.response?.data?.message || 'Gagal menugaskan role.'});
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title='Kelola Admin' subtitle='Tugaskan dan kelola akun administrator platform.'>

      {/* Role legend */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14,marginBottom:24}}>
        {ROLES.map(r => (
          <div key={r.code} className='card' style={{padding:16,borderLeft:`3px solid #8b5cf6`,background:'rgba(139,92,246,0.04)'}}>
            <div style={{fontWeight:700,color:'#a78bfa',fontSize:'0.9rem',marginBottom:4}}>{r.label}</div>
            <div style={{fontSize:'0.78rem',color:'#64748b',lineHeight:1.5}}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button className='button small'
          style={{background:'rgba(139,92,246,0.15)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.3)',padding:'8px 18px',fontWeight:700}}
          onClick={() => setForm({userId:'', adminRoleCode:'ADMIN'})}>
          <i className='fa-solid fa-user-plus' style={{marginRight:8}}/>Tambah Admin
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
          <div style={{width:'min(440px,95vw)',background:'#0d0f1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:28,boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}}>
            <h3 style={{margin:'0 0 18px',color:'#f7f8ff',fontSize:'1.05rem'}}>Tugaskan Role Admin</h3>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={{display:'block',fontSize:'0.78rem',fontWeight:600,color:'#94a3b8',marginBottom:4}}>User ID *</label>
                <input className='admin-search' type='number' placeholder='ID pengguna'
                  value={form.userId} onChange={e=>setForm(p=>({...p,userId:e.target.value}))} />
                <p style={{margin:'4px 0 0',fontSize:'0.73rem',color:'#4b5563'}}>ID numerik dari tabel users (cek di Buyer Management)</p>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.78rem',fontWeight:600,color:'#94a3b8',marginBottom:4}}>Role *</label>
                <select className='admin-select' style={{width:'100%'}} value={form.adminRoleCode}
                  onChange={e=>setForm(p=>({...p,adminRoleCode:e.target.value}))}>
                  {ROLES.map(r=><option key={r.code} value={r.code}>{r.label} ({r.code})</option>)}
                </select>
              </div>
              <div style={{padding:'10px 14px',borderRadius:10,background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',fontSize:'0.78rem',color:'#d97706'}}>
                <i className='fa-solid fa-triangle-exclamation' style={{marginRight:6}}/>
                Pastikan user ID yang dimasukkan sudah terdaftar dan belum memiliki role admin aktif.
              </div>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
              <button className='button small' onClick={()=>setForm(null)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8'}}>Batal</button>
              <button className='button small' disabled={saving} onClick={save}
                style={{background:'rgba(139,92,246,0.2)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.35)'}}>
                {saving?'Menyimpan…':'Tugaskan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='card' style={{padding:0,overflow:'hidden'}}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr><th>ID</th><th>Nama / Email</th><th>Role Sistem</th><th>Role Admin</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} style={{textAlign:'center',padding:32,color:'#64748b'}}>Memuat...</td></tr>}
              {!loading && admins.length===0 && <tr><td colSpan={5} style={{textAlign:'center',padding:32,color:'#64748b'}}>Belum ada admin yang ditugaskan.</td></tr>}
              {!loading && admins.map(a => (
                <tr key={a.id}>
                  <td style={{color:'#64748b',fontSize:'0.8rem'}}>#{a.id}</td>
                  <td>
                    <div style={{fontWeight:600,color:'#f7f8ff'}}>{a.full_name||a.username}</div>
                    <div style={{fontSize:'0.75rem',color:'#64748b'}}>{a.email}</div>
                  </td>
                  <td>
                    <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:6,fontWeight:700,
                      background:'rgba(139,92,246,0.1)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.2)'}}>
                      {a.role}
                    </span>
                  </td>
                  <td>
                    <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:6,fontWeight:700,fontFamily:'monospace',
                      background:'rgba(34,211,238,0.08)',color:'#22d3ee',border:'1px solid rgba(34,211,238,0.2)'}}>
                      {a.admin_role||a.admin_role_name||'—'}
                    </span>
                  </td>
                  <td>
                    <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:20,fontWeight:700,
                      background:a.status==='ACTIVE'?'rgba(16,185,129,0.1)':'rgba(100,116,139,0.1)',
                      color:a.status==='ACTIVE'?'#10b981':'#64748b',
                      border:`1px solid ${a.status==='ACTIVE'?'rgba(16,185,129,0.25)':'rgba(100,116,139,0.2)'}`}}>
                      {a.status||'ACTIVE'}
                    </span>
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
