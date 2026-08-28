import React, { useEffect, useState, useCallback, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmtDate = d => d ? new Date(d).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

const ACTION_COLOR = {
  USER_SUSPEND:'#ef4444', USER_RESTORE:'#10b981', USER_STATUS_CHANGED:'#f59e0b',
  SELLER_STATUS_CHANGED:'#a78bfa', SELLER_APPROVE:'#10b981', SELLER_REJECT:'#ef4444',
  SETTINGS_UPDATE:'#60a5fa', VOUCHER_CREATE:'#34d399', VOUCHER_UPDATE:'#34d399',
  CATEGORY_CREATE:'#22d3ee', CATEGORY_UPDATE:'#22d3ee',
  ADMIN_ROLE_ASSIGN:'#f472b6', LEGAL_DOC_CREATE:'#f59e0b', LEGAL_DOC_UPDATE:'#f59e0b',
};

export default function SuperAdminAuditLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search,  setSearch]  = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const searchTimer = useRef(null);

  const load = useCallback(async (pg = 1, q = search, act = actionFilter) => {
    setLoading(true);
    try {
      const params = { limit: 50, offset: (pg-1)*50 };
      if (q)   params.action = q;
      if (act) params.action = act;
      const r = await api.get('/admin/audit-logs', { params });
      const data = r.data?.logs || [];
      setLogs(prev => pg === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 50);
      setPage(pg);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, actionFilter]);

  useEffect(() => { load(1); }, []);

  const handleSearch = val => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val, actionFilter), 400);
  };

  return (
    <AdminLayout title='Audit Log' subtitle='Rekaman seluruh aktivitas admin pada platform.'>
      <div className='admin-filter-row'>
        <input className='admin-search' placeholder='Cari action, resource...' value={search}
          onChange={e => handleSearch(e.target.value)} />
        <select className='admin-select' value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); load(1, search, e.target.value); }}>
          <option value=''>Semua Action</option>
          {['USER_SUSPEND','USER_RESTORE','USER_STATUS_CHANGED','SELLER_APPROVE','SELLER_REJECT',
            'SETTINGS_UPDATE','VOUCHER_CREATE','CATEGORY_CREATE','ADMIN_ROLE_ASSIGN',
            'LEGAL_DOC_CREATE','LEGAL_DOC_UPDATE'].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button className='button small' onClick={() => load(1)} disabled={loading}>
          {loading ? '...' : '↻ Refresh'}
        </button>
      </div>

      <div className='card' style={{padding:0,overflow:'hidden'}}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Resource</th>
                <th>ID Resource</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {loading && page===1 && (
                <tr><td colSpan={6} style={{textAlign:'center',padding:32,color:'#64748b'}}>Memuat...</td></tr>
              )}
              {!loading && logs.length===0 && (
                <tr><td colSpan={6} style={{textAlign:'center',padding:32,color:'#64748b'}}>Tidak ada log.</td></tr>
              )}
              {logs.map((log, i) => {
                const ac = String(log.action||'');
                const color = ACTION_COLOR[ac] || '#64748b';
                return (
                  <tr key={log.id||i}>
                    <td style={{fontSize:'0.78rem',color:'#64748b',whiteSpace:'nowrap'}}>{fmtDate(log.created_at)}</td>
                    <td>
                      <div style={{fontWeight:600,color:'#e2e8f0',fontSize:'0.85rem'}}>{log.admin_name||log.actor_name||`ID #${log.admin_id||log.actor_id}`}</div>
                      {log.admin_email && <div style={{fontSize:'0.72rem',color:'#64748b'}}>{log.admin_email}</div>}
                    </td>
                    <td>
                      <span style={{display:'inline-block',padding:'2px 8px',borderRadius:6,fontSize:'0.72rem',fontWeight:700,
                        background:`${color}18`,color,border:`1px solid ${color}30`,fontFamily:'monospace'}}>
                        {ac}
                      </span>
                    </td>
                    <td style={{fontSize:'0.82rem',color:'#94a3b8'}}>{log.resource_type||'—'}</td>
                    <td style={{fontSize:'0.78rem',color:'#64748b',fontFamily:'monospace'}}>{log.resource_id||'—'}</td>
                    <td style={{fontSize:'0.75rem',color:'#4b5563',fontFamily:'monospace'}}>{log.ip||'—'}</td>
                  </tr>
                );
              })}
              {!loading && hasMore && (
                <tr>
                  <td colSpan={6} style={{textAlign:'center',padding:16}}>
                    <button className='admin-page-btn' onClick={() => load(page+1)}>
                      Muat lebih banyak
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
