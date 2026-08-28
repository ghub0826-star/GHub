import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import * as adminService from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';

const fmtNum  = (n) => Number(n || 0).toLocaleString('id-ID');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ── Badge status sederhana ── */
function Badge({ value, color }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 20,
      fontSize: '0.72rem',
      fontWeight: 700,
      background: `${color}18`,
      color,
      border: `1px solid ${color}33`,
      textTransform: 'uppercase',
    }}>
      {value}
    </span>
  );
}

/* ── Quick-Action card untuk buyer/seller management ── */
function ManagementCard({ title, subtitle, icon, color, to, stats, loading }) {
  return (
    <div className='card' style={{
      padding: 22,
      border: `1px solid ${color}22`,
      borderTop: `3px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: `${color}15`, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            <i className={`fa-solid ${icon}`} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f7f8ff' }}>{title}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 1 }}>{subtitle}</div>
          </div>
        </div>
        <Link
          to={to}
          className='button small'
          style={{
            background: `${color}15`, color,
            border: `1px solid ${color}33`,
            borderRadius: 9, padding: '6px 14px',
            fontSize: '0.8rem', fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          Kelola <i className='fa-solid fa-arrow-right' style={{ fontSize: '0.7rem' }} />
        </Link>
      </div>

      {/* Mini stats */}
      {loading ? (
        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Memuat...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color || '#f7f8ff', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview list */}
      {!loading && Array.isArray(stats[0]?.preview) && stats[0].preview.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Terbaru
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stats[0].preview.map((item, i) => (
              <div key={item.id || i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 9,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
                gap: 10,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>{item.sub}</div>
                </div>
                <Badge value={item.status} color={item.statusColor} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function AdminDashboard() {
  const [summary,     setSummary]     = useState(null);
  const [disputes,    setDisputes]    = useState([]);
  const [refunds,     setRefunds]     = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [tickets,     setTickets]     = useState([]);
  const [buyers,      setBuyers]      = useState([]);
  const [sellers,     setSellers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [buyerLoading,  setBuyerLoading]  = useState(true);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [error,       setError]       = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let dashData = null;
      try {
        const res = await api.get('/admin/dashboard');
        dashData = res.data?.summary || res.data;
        if (res.data?.lists) {
          if (res.data.lists.recentDisputes)    setDisputes(res.data.lists.recentDisputes);
          if (res.data.lists.recentWithdrawals) setWithdrawals(res.data.lists.recentWithdrawals);
        }
      } catch {
        try { const r = await api.get('/admin/summary'); dashData = r.data; } catch { /* ignore */ }
      }
      setSummary(dashData || {});

      const [dR, rR, wR, tR] = await Promise.allSettled([
        api.get('/admin/disputes'),
        api.get('/admin/refunds'),
        api.get('/admin/withdrawals'),
        api.get('/tickets'),
      ]);
      if (dR.status === 'fulfilled') { const d = dR.value.data; setDisputes(Array.isArray(d) ? d : (d.disputes || [])); }
      if (rR.status === 'fulfilled') { const d = rR.value.data; setRefunds(Array.isArray(d) ? d : (d.refunds || [])); }
      if (wR.status === 'fulfilled') { const d = wR.value.data; setWithdrawals(Array.isArray(d) ? d : (d.withdrawals || [])); }
      if (tR.status === 'fulfilled') { const d = tR.value.data; setTickets(Array.isArray(d) ? d : (d.tickets || [])); }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  }, []);

  /* Load buyer & seller preview (5 terbaru) */
  const loadManagement = useCallback(async () => {
    setBuyerLoading(true);
    setSellerLoading(true);
    try {
      const bRes = await adminService.listUsers({ limit: 5, sort: 'desc' });
      setBuyers(bRes.data?.data || []);
    } catch { /* ignore */ }
    finally { setBuyerLoading(false); }

    try {
      const sRes = await adminService.listSellers({ limit: 5 });
      setSellers(sRes.data?.sellers || []);
    } catch { /* ignore */ }
    finally { setSellerLoading(false); }
  }, []);

  useEffect(() => { loadData(); loadManagement(); }, [loadData, loadManagement]);

  const updateDispute = async (id, status) => {
    try { await api.post(`/admin/disputes/${id}/resolve`, { resolution: status }); }
    catch { await api.patch(`/disputes/${id}`, { status }); }
    loadData();
  };
  const updateRefund = async (id, status) => {
    try { if (status === 'approved') await api.post(`/admin/refunds/${id}/approve`); else await api.post(`/admin/refunds/${id}/reject`, { reason: 'Ditolak oleh admin' }); }
    catch { await api.patch(`/refunds/${id}`, { status }); }
    loadData();
  };
  const updateWithdrawal = async (id, status) => {
    try { if (status === 'approved') await api.post(`/admin/withdrawals/${id}/approve`); else await api.post(`/admin/withdrawals/${id}/reject`, { reason: 'Ditolak oleh admin' }); }
    catch (e) { console.error(e); }
    loadData();
  };
  const updateTicket = async (id, status) => {
    try { await api.patch(`/tickets/${id}/status`, { status }); } catch (e) { console.error(e); }
    loadData();
  };

  /* Derived numbers */
  const totalUsers      = summary?.total_users ?? summary?.totalUsers ?? 0;
  const totalOrders     = summary?.total_orders ?? summary?.todayOrders ?? 0;
  const totalDisputes   = summary?.openDisputes ?? disputes.length;
  const totalRefunds    = summary?.pendingRefunds ?? refunds.length;
  const totalWithdrawals = summary?.pendingWithdrawals ?? withdrawals.length;

  /* Buyer stats */
  const buyerActive    = buyers.filter(u => u.account_status === 'ACTIVE').length;
  const buyerSuspended = buyers.filter(u => ['SUSPENDED','BANNED'].includes(u.account_status)).length;
  const buyerPreview   = buyers.slice(0, 4).map(u => ({
    id: u.id,
    name: u.full_name || u.username,
    sub: u.email,
    status: u.account_status || '—',
    statusColor: u.account_status === 'ACTIVE' ? '#10b981' : u.account_status === 'SUSPENDED' ? '#ef4444' : '#f59e0b',
  }));

  /* Seller stats */
  const sellerPending  = sellers.filter(s => String(s.verification_status || '').toUpperCase() === 'PENDING').length;
  const sellerApproved = sellers.filter(s => ['APPROVED','VERIFIED'].includes(String(s.verification_status || '').toUpperCase())).length;
  const sellerPreview  = sellers.slice(0, 4).map(s => ({
    id: s.id,
    name: s.store_name || s.username,
    sub: s.email,
    status: s.verification_status || 'PENDING',
    statusColor: ['APPROVED','VERIFIED'].includes(String(s.verification_status || '').toUpperCase()) ? '#10b981' : s.verification_status === 'SUSPENDED' ? '#ef4444' : '#f59e0b',
  }));

  return (
    <AdminLayout
      title='Admin Dashboard'
      subtitle='Ringkasan platform, manajemen pengguna, dan antrian persetujuan.'
    >
      {error && (
        <div className='error' style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {/* ── Platform summary stats ── */}
      <div className='admin-stat-grid' style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Pengguna',     value: fmtNum(totalUsers),      color: '#22d3ee' },
          { label: 'Total Pesanan',      value: fmtNum(totalOrders),     color: '#4facfe' },
          { label: 'Request Penarikan',  value: fmtNum(totalWithdrawals),color: '#f59e0b' },
          { label: 'Sengketa Aktif',     value: fmtNum(totalDisputes),   color: '#ef4444' },
          { label: 'Permintaan Refund',  value: fmtNum(totalRefunds),    color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className='admin-stat-card'>
            <div className='admin-stat-value' style={{ color: s.color }}>{loading ? '...' : s.value}</div>
            <div className='admin-stat-label'>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          BUYER & SELLER MANAGEMENT — dua kolom
      ═══════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* BUYER MANAGEMENT */}
        <ManagementCard
          title='Buyer Management'
          subtitle='Kelola akun pembeli — suspend, restore, force logout'
          icon='fa-users'
          color='#22d3ee'
          to='/admin/users'
          loading={buyerLoading}
          stats={[
            {
              label: 'Total Buyer',
              value: fmtNum(totalUsers || buyers.length),
              color: '#22d3ee',
              preview: buyerPreview,
            },
            { label: 'Aktif',      value: fmtNum(buyerActive),    color: '#10b981' },
            { label: 'Tersuspend', value: fmtNum(buyerSuspended), color: '#ef4444' },
          ]}
        />

        {/* SELLER MANAGEMENT */}
        <ManagementCard
          title='Seller Management'
          subtitle='Verifikasi, setujui, tolak, atau suspend seller'
          icon='fa-store'
          color='#a78bfa'
          to='/admin/sellers'
          loading={sellerLoading}
          stats={[
            {
              label: 'Total Seller',
              value: fmtNum(sellers.length),
              color: '#a78bfa',
              preview: sellerPreview,
            },
            { label: 'Menunggu Review', value: fmtNum(sellerPending),  color: '#f59e0b' },
            { label: 'Disetujui',       value: fmtNum(sellerApproved), color: '#10b981' },
          ]}
        />
      </div>

      {/* ── Quick links row ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        {[
          { to: '/admin/users',    icon: 'fa-users',           label: 'Buyer Management', color: '#22d3ee' },
          { to: '/admin/sellers',  icon: 'fa-store',           label: 'Seller Management', color: '#a78bfa' },
          { to: '/admin/disputes', icon: 'fa-scale-balanced',  label: 'Disputes', color: '#f87171' },
          { to: '/admin/enterprise', icon: 'fa-building-columns', label: 'Enterprise', color: '#60a5fa' },
          { to: '/admin/ai',       icon: 'fa-robot',           label: 'AI Platform', color: '#34d399' },
        ].map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 10,
              background: `${l.color}10`,
              border: `1px solid ${l.color}28`,
              color: l.color, fontSize: '0.85rem', fontWeight: 700,
              textDecoration: 'none', transition: 'background 0.15s',
            }}
          >
            <i className={`fa-solid ${l.icon}`} />
            {l.label}
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          ANTRIAN TINDAKAN ADMIN
      ═══════════════════════════════════════════════ */}

      {/* Pending sellers — jika ada */}
      {sellerPending > 0 && (
        <div className='card' style={{ marginBottom: 20, borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, margin: 0, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className='fa-solid fa-hourglass-half' /> Seller Menunggu Verifikasi ({sellerPending})
            </h2>
            <Link to='/admin/sellers' style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700, textDecoration: 'none' }}>
              Lihat semua →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sellers.filter(s => String(s.verification_status || '').toUpperCase() === 'PENDING').map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 9, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f7f8ff', fontSize: '0.875rem' }}>{s.store_name || s.username}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 1 }}>{s.email}</div>
                </div>
                <Link
                  to='/admin/sellers'
                  style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disputes */}
      <div className='card' style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Sengketa Pesanan</h2>
          <button className='button small' onClick={loadData} disabled={loading} style={{ padding: '5px 12px' }}>
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>
        {disputes.length === 0 ? (
          <p style={{ color: 'var(--muted)', margin: 0 }}>Tidak ada sengketa aktif.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {disputes.map(item => (
              <div key={item.id} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>{item.reason || item.dispute_number || `Sengketa #${item.id}`}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 12 }}>({item.status})</span>
                  {item.description && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{item.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className='button small' onClick={() => updateDispute(item.id, 'resolved')}>Resolve</button>
                  <button className='button small secondary' onClick={() => updateDispute(item.id, 'rejected')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refunds */}
      <div className='card' style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Permintaan Refund</h2>
        {refunds.length === 0 ? (
          <p style={{ color: 'var(--muted)', margin: 0 }}>Tidak ada permintaan refund pending.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {refunds.map(item => (
              <div key={item.id} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>Rp {Number(item.amount || 0).toLocaleString()}</strong> — {item.reason || 'Permintaan Refund'}
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 12 }}>({item.status})</span>
                  {item.order_number && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Order: {item.order_number}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className='button small' onClick={() => updateRefund(item.id, 'approved')}>Approve</button>
                  <button className='button small secondary' onClick={() => updateRefund(item.id, 'rejected')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawals */}
      <div className='card' style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Request Penarikan Saldo</h2>
        {withdrawals.length === 0 ? (
          <p style={{ color: 'var(--muted)', margin: 0 }}>Tidak ada request penarikan aktif.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {withdrawals.map(item => (
              <div key={item.id || `${item.user_id}-${item.amount}`} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>{item.seller_name || item.user_name || `User #${item.seller_id || item.user_id}`}</strong> — Rp {Number(item.amount || 0).toLocaleString()}
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 12 }}>({item.status})</span>
                  {item.bank_name && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.bank_name} - {item.account_number} ({item.account_holder})</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className='button small' onClick={() => updateWithdrawal(item.id, 'approved')}>Approve</button>
                  <button className='button small secondary' onClick={() => updateWithdrawal(item.id, 'rejected')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Tickets */}
      <div className='card'>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Tiket Bantuan</h2>
        {tickets.length === 0 ? (
          <p style={{ color: 'var(--muted)', margin: 0 }}>Tidak ada tiket support aktif.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tickets.map(ticket => (
              <div key={ticket.id} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>{ticket.subject || `Tiket #${ticket.id}`}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 12 }}>({ticket.status})</span>
                  {ticket.messages?.length > 0 && (
                    <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                      {ticket.messages[ticket.messages.length - 1]?.text}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className='button small' onClick={() => updateTicket(ticket.id, 'resolved')}>Resolve</button>
                  <button className='button small secondary' onClick={() => updateTicket(ticket.id, 'closed')}>Close</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
