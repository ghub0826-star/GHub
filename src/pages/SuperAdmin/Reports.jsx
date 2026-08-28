import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmtIDR  = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(Number(n||0));
const fmtNum  = n => Number(n||0).toLocaleString('id-ID');

function StatCard({ label, value, color, icon }) {
  return (
    <div className='admin-stat-card'>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <div style={{width:36,height:36,borderRadius:10,background:`${color}18`,color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>
          <i className={`fa-solid ${icon}`}/>
        </div>
        <div className='admin-stat-label'>{label}</div>
      </div>
      <div className='admin-stat-value' style={{color,fontSize:'1.5rem'}}>{value}</div>
    </div>
  );
}

export default function SuperAdminReports() {
  const [overview, setOverview] = useState(null);
  const [revenue,  setRevenue]  = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rev, top] = await Promise.allSettled([
        api.get('/admin/reports/overview'),
        api.get('/admin/reports/revenue'),
        api.get('/admin/reports/top'),
      ]);
      if (ov.status==='fulfilled')  setOverview(ov.value.data?.overview || ov.value.data || {});
      if (rev.status==='fulfilled') setRevenue(rev.value.data?.revenue || []);
      if (top.status==='fulfilled') setTopSellers(top.value.data?.topSellers || top.value.data?.sellers || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(); },[load]);

  return (
    <AdminLayout title='Laporan & Analitik' subtitle='Ringkasan pendapatan, pesanan, dan performa platform.'>
      {/* Overview stats */}
      <div className='admin-stat-grid' style={{marginBottom:24}}>
        <StatCard label='Total Pendapatan'  value={loading?'…':fmtIDR(overview?.total_revenue)}           color='#10b981' icon='fa-coins'/>
        <StatCard label='Total Pesanan'     value={loading?'…':fmtNum(overview?.total_orders)}             color='#60a5fa' icon='fa-receipt'/>
        <StatCard label='Pesanan Selesai'   value={loading?'…':fmtNum(overview?.completed_orders)}         color='#a78bfa' icon='fa-circle-check'/>
        <StatCard label='Total Pembeli'     value={loading?'…':fmtNum(overview?.total_buyers)}             color='#22d3ee' icon='fa-users'/>
        <StatCard label='Total Seller'      value={loading?'…':fmtNum(overview?.total_sellers)}            color='#f59e0b' icon='fa-store'/>
        <StatCard label='Produk Aktif'      value={loading?'…':fmtNum(overview?.active_products)}          color='#f472b6' icon='fa-box'/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:20}}>
        {/* Revenue table */}
        <div className='card' style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'16px 20px 12px',fontWeight:800,fontSize:'0.95rem',color:'#f7f8ff',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            Pendapatan (Rincian)
          </div>
          {loading ? (
            <div style={{padding:24,color:'#64748b',textAlign:'center'}}>Memuat...</div>
          ) : revenue.length===0 ? (
            <div style={{padding:24,color:'#64748b',textAlign:'center'}}>Belum ada data.</div>
          ) : (
            <div className='admin-table-wrap'>
              <table className='admin-table'>
                <thead><tr><th>Periode</th><th style={{textAlign:'right'}}>Pesanan</th><th style={{textAlign:'right'}}>Revenue</th></tr></thead>
                <tbody>
                  {revenue.slice(0,20).map((r,i)=>(
                    <tr key={i}>
                      <td style={{color:'#e2e8f0'}}>{r.period||r.date||`#${i+1}`}</td>
                      <td style={{textAlign:'right'}}>{fmtNum(r.orders||r.order_count)}</td>
                      <td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>{fmtIDR(r.revenue||r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top sellers */}
        <div className='card' style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'16px 20px 12px',fontWeight:800,fontSize:'0.95rem',color:'#f7f8ff',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            Top Seller
          </div>
          {loading ? (
            <div style={{padding:24,color:'#64748b',textAlign:'center'}}>Memuat...</div>
          ) : topSellers.length===0 ? (
            <div style={{padding:24,color:'#64748b',textAlign:'center'}}>Belum ada data.</div>
          ) : (
            <div className='admin-table-wrap'>
              <table className='admin-table'>
                <thead><tr><th>Seller</th><th style={{textAlign:'right'}}>Penjualan</th><th style={{textAlign:'right'}}>Revenue</th></tr></thead>
                <tbody>
                  {topSellers.slice(0,15).map((s,i)=>(
                    <tr key={i}>
                      <td>
                        <div style={{fontWeight:600,color:'#f7f8ff'}}>{s.store_name||s.username||s.name}</div>
                        {s.email && <div style={{fontSize:'0.73rem',color:'#64748b'}}>{s.email}</div>}
                      </td>
                      <td style={{textAlign:'right'}}>{fmtNum(s.total_sales||s.sales)}</td>
                      <td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>{fmtIDR(s.revenue||s.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
