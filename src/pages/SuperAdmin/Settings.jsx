import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

/* Pengaturan Platform — SUPER_ADMIN only */
/* Backend: GET /admin/settings, POST /admin/settings */

const SETTING_GROUPS = [
  {
    title: 'Biaya Platform',
    icon: 'fa-percent',
    color: '#10b981',
    keys: [
      { key:'service_fee_percent',      label:'Biaya Layanan (%)',        type:'number', hint:'Persentase biaya layanan dari setiap transaksi.' },
      { key:'withdrawal_fee_percent',   label:'Biaya Penarikan (%)',      type:'number', hint:'Persentase biaya saat seller menarik saldo.' },
      { key:'payment_fee_percent',      label:'Biaya Pembayaran (%)',     type:'number', hint:'Biaya tambahan per transaksi pembayaran.' },
    ],
  },
  {
    title: 'Batas & Limit',
    icon: 'fa-gauge',
    color: '#f59e0b',
    keys: [
      { key:'min_withdrawal_amount',    label:'Min. Penarikan (Rp)',      type:'number', hint:'Jumlah minimum yang dapat ditarik seller.' },
      { key:'max_withdrawal_amount',    label:'Maks. Penarikan (Rp)',     type:'number', hint:'Jumlah maksimum per request penarikan.' },
      { key:'max_login_attempts',       label:'Maks. Percobaan Login',    type:'number', hint:'Jumlah maksimum sebelum akun dikunci.' },
      { key:'login_lock_minutes',       label:'Durasi Kunci (menit)',     type:'number', hint:'Durasi akun dikunci setelah percobaan gagal.' },
    ],
  },
  {
    title: 'Fitur Platform',
    icon: 'fa-toggle-on',
    color: '#8b5cf6',
    keys: [
      { key:'maintenance_mode',         label:'Mode Maintenance',         type:'toggle', hint:'Aktifkan untuk menutup platform sementara.' },
      { key:'seller_registration_open', label:'Pendaftaran Seller Terbuka', type:'toggle', hint:'Izinkan seller baru mendaftar.' },
      { key:'buyer_registration_open',  label:'Pendaftaran Pembeli Terbuka', type:'toggle', hint:'Izinkan pembeli baru mendaftar.' },
      { key:'enable_2fa_mandatory',     label:'2FA Wajib untuk Admin',   type:'toggle', hint:'Wajibkan 2FA untuk semua akun admin.' },
    ],
  },
  {
    title: 'Kontak & Informasi',
    icon: 'fa-building',
    color: '#60a5fa',
    keys: [
      { key:'platform_name',            label:'Nama Platform',            type:'text',   hint:'Nama yang ditampilkan di halaman.' },
      { key:'support_email',            label:'Email Support',            type:'text',   hint:'Email yang dihubungi pengguna.' },
      { key:'whatsapp_support',         label:'WhatsApp Support',         type:'text',   hint:'Nomor WA tim support.' },
    ],
  },
];

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [changed,  setChanged]  = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/settings');
      const raw = r.data?.settings || [];
      const map = {};
      if (Array.isArray(raw)) raw.forEach(s => { map[s.setting_key] = s.setting_value; });
      else Object.assign(map, raw);
      setSettings(map);
      setChanged({});
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setChanged(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (Object.keys(changed).length === 0) {
      setMsg({type:'info', text:'Tidak ada perubahan untuk disimpan.'}); return;
    }
    setSaving(true); setMsg(null);
    try {
      await api.post('/admin/settings', { settings: changed });
      setMsg({type:'success', text:`${Object.keys(changed).length} pengaturan berhasil disimpan.`});
      setChanged({});
    } catch(e) {
      setMsg({type:'error', text: e?.response?.data?.message || 'Gagal menyimpan pengaturan.'});
    } finally { setSaving(false); }
  };

  const val = key => settings[key] ?? '';
  const isTrue = key => { const v = val(key); return v === 'true' || v === '1' || v === true; };

  return (
    <AdminLayout title='Pengaturan Platform' subtitle='Konfigurasi global platform yang hanya dapat diubah oleh Super Admin.'>

      {/* Warning banner */}
      <div style={{padding:'12px 18px',borderRadius:10,marginBottom:24,display:'flex',alignItems:'center',gap:10,
        background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#fca5a5',fontSize:'0.875rem'}}>
        <i className='fa-solid fa-triangle-exclamation' style={{flexShrink:0,fontSize:'1rem'}}/>
        <span>Perubahan di halaman ini mempengaruhi seluruh platform secara langsung. Lakukan dengan hati-hati.</span>
      </div>

      {msg && (
        <div style={{padding:'10px 16px',borderRadius:10,marginBottom:16,fontWeight:600,fontSize:'0.875rem',
          background:msg.type==='success'?'rgba(16,185,129,0.1)':msg.type==='info'?'rgba(96,165,250,0.1)':'rgba(239,68,68,0.1)',
          border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.25)':msg.type==='info'?'rgba(96,165,250,0.25)':'rgba(239,68,68,0.25)'}`,
          color:msg.type==='success'?'#10b981':msg.type==='info'?'#60a5fa':'#ef4444'}}>
          <i className={`fa-solid ${msg.type==='success'?'fa-circle-check':msg.type==='info'?'fa-circle-info':'fa-circle-exclamation'}`} style={{marginRight:8}}/>{msg.text}
        </div>
      )}

      {loading ? (
        <div style={{padding:48,textAlign:'center',color:'#64748b'}}>Memuat pengaturan...</div>
      ) : (
        <>
          <div style={{display:'flex',flexDirection:'column',gap:20,marginBottom:24}}>
            {SETTING_GROUPS.map(group => (
              <div key={group.title} className='card' style={{borderLeft:`3px solid ${group.color}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18,paddingBottom:14,borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${group.color}15`,color:group.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>
                    <i className={`fa-solid ${group.icon}`}/>
                  </div>
                  <div style={{fontWeight:800,color:'#f7f8ff',fontSize:'0.95rem'}}>{group.title}</div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
                  {group.keys.map(field => (
                    <div key={field.key}>
                      <label style={{display:'block',fontWeight:700,color:'#e2e8f0',fontSize:'0.85rem',marginBottom:6}}>
                        {field.label}
                        {changed[field.key] !== undefined && (
                          <span style={{marginLeft:8,fontSize:'0.68rem',padding:'1px 6px',borderRadius:6,background:'rgba(245,158,11,0.15)',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.25)'}}>
                            diubah
                          </span>
                        )}
                      </label>

                      {field.type === 'toggle' ? (
                        <div style={{display:'flex',alignItems:'center',gap:12}}>
                          <button
                            type='button'
                            onClick={() => handleChange(field.key, isTrue(field.key) ? 'false' : 'true')}
                            style={{
                              position:'relative', width:48, height:26, borderRadius:13,
                              background: isTrue(field.key) ? group.color : 'rgba(100,116,139,0.3)',
                              border:'none', cursor:'pointer', transition:'background 0.2s', flexShrink:0,
                            }}
                          >
                            <span style={{
                              position:'absolute', top:3, left: isTrue(field.key) ? 25 : 3,
                              width:20, height:20, borderRadius:'50%', background:'#fff',
                              transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
                            }}/>
                          </button>
                          <span style={{fontSize:'0.85rem',color: isTrue(field.key) ? '#10b981' : '#64748b',fontWeight:600}}>
                            {isTrue(field.key) ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      ) : (
                        <input
                          className='admin-search'
                          type={field.type}
                          value={val(field.key)}
                          onChange={e => handleChange(field.key, e.target.value)}
                          style={{width:'100%'}}
                        />
                      )}

                      {field.hint && (
                        <p style={{margin:'4px 0 0',fontSize:'0.73rem',color:'#4b5563',lineHeight:1.4}}>{field.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save bar */}
          <div style={{
            position:'sticky', bottom:20, zIndex:10,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 20px', borderRadius:14,
            background:'rgba(13,15,30,0.97)', border:'1px solid rgba(255,255,255,0.1)',
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)', backdropFilter:'blur(12px)',
          }}>
            <div style={{fontSize:'0.875rem',color:'#64748b'}}>
              {Object.keys(changed).length > 0
                ? <><span style={{color:'#f59e0b',fontWeight:700}}>{Object.keys(changed).length} pengaturan</span> belum disimpan</>
                : 'Semua pengaturan tersimpan.'}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className='button small' onClick={load} disabled={loading||saving}
                style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8'}}>
                Reset
              </button>
              <button className='button small' onClick={save} disabled={saving||Object.keys(changed).length===0}
                style={{background:Object.keys(changed).length>0?'rgba(16,185,129,0.2)':'rgba(100,116,139,0.1)',
                  color:Object.keys(changed).length>0?'#10b981':'#64748b',
                  border:`1px solid ${Object.keys(changed).length>0?'rgba(16,185,129,0.35)':'rgba(100,116,139,0.2)'}`,
                  padding:'8px 20px'}}>
                <i className='fa-solid fa-floppy-disk' style={{marginRight:8}}/>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
