import React, { useEffect, useState, useCallback, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import * as adminService from '../../services/adminService';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtNum  = (n) => Number(n || 0).toLocaleString('id-ID');

function VerifBadge({ status }) {
  const s = String(status || 'pending').toLowerCase();
  const map = {
    approved: 'active',
    verified: 'active',
    pending:  'pending',
    rejected: 'rejected',
    suspended:'suspended',
  };
  return <span className={`admin-badge admin-badge--${map[s] || 'pending'}`}>{status || 'PENDING'}</span>;
}

/* ── Confirm modal ── */
function ConfirmModal({ title, placeholder, onConfirm, onCancel, confirmLabel = 'Konfirmasi', danger = false }) {
  const [value, setValue] = useState('');
  return (
    <div className='admin-drawer-backdrop' onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className='admin-modal'>
        <h3 className='admin-modal-title'>{title}</h3>
        {placeholder && (
          <textarea
            className='admin-search'
            rows={3}
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ resize: 'vertical', width: '100%' }}
          />
        )}
        <div className='admin-modal-btns'>
          <button className='button small' onClick={onCancel}>Batal</button>
          <button
            className='button small'
            style={danger
              ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
              : { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
            }
            onClick={() => onConfirm(value)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Detail drawer ── */
function SellerDrawer({ sellerId, onClose, onRefresh }) {
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy,   setBusy]   = useState(false);
  const [msg,    setMsg]    = useState(null);
  const [modal,  setModal]  = useState(null); // { type: 'approve'|'reject'|'revision'|'suspend'|'restore' }

  const loadDetail = () => {
    setLoading(true);
    adminService.getSellerDetail(sellerId)
      .then(r => setData(r.data))
      .catch(() => setMsg({ type: 'error', text: 'Gagal memuat detail seller.' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDetail(); }, [sellerId]);

  const action = async (fn, label) => {
    setBusy(true);
    setMsg(null);
    setModal(null);
    try {
      await fn();
      setMsg({ type: 'success', text: `${label} berhasil.` });
      onRefresh();
      loadDetail();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || `${label} gagal.` });
    } finally {
      setBusy(false);
    }
  };

  const seller = data?.seller;
  const verifStatus = String(seller?.verification_status || seller?.status || 'PENDING').toUpperCase();
  const isPending  = verifStatus === 'PENDING';
  const isApproved = verifStatus === 'APPROVED' || verifStatus === 'VERIFIED';
  const isSuspended = verifStatus === 'SUSPENDED';

  return (
    <div className='admin-drawer-backdrop' onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className='admin-drawer'>
        <div className='admin-drawer-header'>
          <div>
            <h2 className='admin-drawer-title'>Detail Seller</h2>
            {seller && <p className='admin-drawer-sub'>ID #{seller.id} · {seller.email}</p>}
          </div>
          <button className='admin-drawer-close' onClick={onClose}><i className='fa-solid fa-xmark' /></button>
        </div>

        <div className='admin-drawer-body'>
          {loading && <p className='admin-drawer-loading'>Memuat...</p>}

          {msg && (
            <div className={`admin-drawer-msg admin-drawer-msg--${msg.type}`}>
              <i className={`fa-solid ${msg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
              {msg.text}
            </div>
          )}

          {seller && !loading && (
            <>
              {/* Profil */}
              <div className='admin-drawer-section'>
                <div className='admin-drawer-avatar admin-drawer-avatar--seller'>
                  {seller.logo
                    ? <img src={seller.logo} alt='logo' />
                    : <span>{(seller.store_name || seller.username || 'S').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <div className='admin-drawer-uname'>{seller.store_name || seller.full_name || seller.username}</div>
                  <div className='admin-drawer-email'>{seller.email} · {seller.phone || '—'}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <VerifBadge status={verifStatus} />
                    {seller.store_slug && (
                      <span className='admin-badge admin-badge--buyer'>/{seller.store_slug}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className='admin-drawer-grid'>
                {[
                  ['Nama Pemilik',  seller.full_name || seller.username || '—'],
                  ['Nama Toko',     seller.store_name || '—'],
                  ['Store Slug',    seller.store_slug || '—'],
                  ['Email',         seller.email || '—'],
                  ['Telepon',       seller.phone || '—'],
                  ['Rating',        seller.rating ? `${seller.rating} ★` : '—'],
                  ['Total Penjualan', fmtNum(seller.total_sales)],
                  ['Terdaftar',     fmtDate(seller.created_at)],
                ].map(([k, v]) => (
                  <div key={k} className='admin-drawer-kv'>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </div>

              {/* Dokumen verifikasi */}
              {seller.verification?.documents && (
                <div className='admin-drawer-section'>
                  <h3 className='admin-drawer-sec-title'>Dokumen Verifikasi</h3>
                  <pre style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                    {JSON.stringify(seller.verification.documents, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className='admin-drawer-section admin-drawer-actions'>
                <h3 className='admin-drawer-sec-title'>Aksi Verifikasi</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {isPending && (
                    <>
                      <button
                        className='button small'
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                        disabled={busy}
                        onClick={() => setModal({ type: 'approve' })}
                      >
                        <i className='fa-solid fa-check' /> Setujui
                      </button>
                      <button
                        className='button small'
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                        disabled={busy}
                        onClick={() => setModal({ type: 'reject' })}
                      >
                        <i className='fa-solid fa-xmark' /> Tolak
                      </button>
                      <button
                        className='button small'
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                        disabled={busy}
                        onClick={() => setModal({ type: 'revision' })}
                      >
                        <i className='fa-solid fa-rotate' /> Minta Revisi
                      </button>
                    </>
                  )}
                  {isApproved && (
                    <button
                      className='button small'
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                      disabled={busy}
                      onClick={() => setModal({ type: 'suspend' })}
                    >
                      <i className='fa-solid fa-ban' /> Suspend Seller
                    </button>
                  )}
                  {isSuspended && (
                    <button
                      className='button small'
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                      disabled={busy}
                      onClick={() => setModal({ type: 'restore' })}
                    >
                      <i className='fa-solid fa-rotate-left' /> Pulihkan Seller
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'approve' && (
        <ConfirmModal
          title='Setujui Seller'
          placeholder='Catatan (opsional)'
          confirmLabel='Setujui'
          onCancel={() => setModal(null)}
          onConfirm={note => action(() => adminService.approveSeller(sellerId, note), 'Persetujuan seller')}
        />
      )}
      {modal?.type === 'reject' && (
        <ConfirmModal
          title='Tolak Pendaftaran Seller'
          placeholder='Alasan penolakan (wajib)'
          confirmLabel='Tolak'
          danger
          onCancel={() => setModal(null)}
          onConfirm={reason => action(() => adminService.rejectSeller(sellerId, reason), 'Penolakan seller')}
        />
      )}
      {modal?.type === 'revision' && (
        <ConfirmModal
          title='Minta Revisi Dokumen'
          placeholder='Catatan untuk seller (wajib)'
          confirmLabel='Kirim'
          onCancel={() => setModal(null)}
          onConfirm={reason => action(() => adminService.requestRevision(sellerId, reason), 'Permintaan revisi')}
        />
      )}
      {modal?.type === 'suspend' && (
        <ConfirmModal
          title='Suspend Seller'
          placeholder='Alasan suspend (opsional)'
          confirmLabel='Suspend'
          danger
          onCancel={() => setModal(null)}
          onConfirm={reason => action(() => adminService.suspendSeller(sellerId, reason), 'Suspend seller')}
        />
      )}
      {modal?.type === 'restore' && (
        <ConfirmModal
          title='Pulihkan Seller'
          placeholder='Catatan (opsional)'
          confirmLabel='Pulihkan'
          onCancel={() => setModal(null)}
          onConfirm={note => action(() => adminService.restoreSeller(sellerId, note), 'Pemulihan seller')}
        />
      )}
    </div>
  );
}

/* ── Main page ── */
export default function AdminSellers() {
  const [sellers,    setSellers]    = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected,   setSelected]   = useState(null);
  const searchTimer = useRef(null);

  const load = useCallback(async (page = 1, q = search, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminService.listSellers({ limit: 20, offset: (page - 1) * 20, search: q, status });
      const list = res.data.sellers || [];
      setSellers(list);
      setPagination({ page, limit: 20, total: res.data.total || list.length });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(1); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val, statusFilter), 400);
  };

  const { page, limit, total } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pendingCount   = sellers.filter(s => String(s.verification_status || '').toUpperCase() === 'PENDING').length;
  const approvedCount  = sellers.filter(s => ['APPROVED','VERIFIED'].includes(String(s.verification_status || '').toUpperCase())).length;
  const suspendedCount = sellers.filter(s => String(s.verification_status || '').toUpperCase() === 'SUSPENDED').length;

  return (
    <AdminLayout
      title='Seller Management'
      subtitle='Kelola verifikasi, persetujuan, dan status seller di platform GHub.'
    >
      {/* Stats */}
      <div className='admin-stat-grid'>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#8b5cf6' }}>{fmtNum(total || sellers.length)}</div>
          <div className='admin-stat-label'>Total Seller</div>
        </div>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#f59e0b' }}>{fmtNum(pendingCount)}</div>
          <div className='admin-stat-label'>Menunggu Review</div>
        </div>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#10b981' }}>{fmtNum(approvedCount)}</div>
          <div className='admin-stat-label'>Disetujui</div>
        </div>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#ef4444' }}>{fmtNum(suspendedCount)}</div>
          <div className='admin-stat-label'>Tersuspend</div>
        </div>
      </div>

      {/* Filter */}
      <div className='admin-filter-row'>
        <input
          className='admin-search'
          placeholder='Cari nama toko, email, atau username...'
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <select className='admin-select' value={statusFilter} onChange={e => { setStatusFilter(e.target.value); load(1, search, e.target.value); }}>
          <option value=''>Semua Status</option>
          <option value='PENDING'>PENDING</option>
          <option value='APPROVED'>APPROVED</option>
          <option value='REJECTED'>REJECTED</option>
          <option value='SUSPENDED'>SUSPENDED</option>
        </select>
        <button className='button small' onClick={() => load(page)} disabled={loading}>
          {loading ? '...' : '↻ Refresh'}
        </button>
      </div>

      {/* Table */}
      <div className='card' style={{ padding: 0, overflow: 'hidden' }}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Toko / Pemilik</th>
                <th>Email</th>
                <th>Status Verifikasi</th>
                <th>Rating</th>
                <th>Total Penjualan</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Memuat...</td></tr>
              )}
              {!loading && sellers.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Tidak ada seller ditemukan.</td></tr>
              )}
              {!loading && sellers.map(s => (
                <tr key={s.id}>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>#{s.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#a78bfa', fontWeight: 700 }}>
                        {s.logo ? <img src={s.logo} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (s.store_name || s.username || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f7f8ff', fontSize: '0.875rem' }}>{s.store_name || s.username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.full_name || s.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{s.email}</td>
                  <td><VerifBadge status={s.verification_status || s.status} /></td>
                  <td style={{ color: '#f59e0b' }}>{s.rating ? `${Number(s.rating).toFixed(1)} ★` : '—'}</td>
                  <td>{fmtNum(s.total_sales)}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{fmtDate(s.created_at || s.seller_created_at)}</td>
                  <td>
                    <button
                      className='button small'
                      style={{ minHeight: 30, padding: '0 10px', fontSize: '0.78rem' }}
                      onClick={() => setSelected(s.id)}
                    >
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='admin-pagination' style={{ padding: '12px 16px' }}>
          <div className='admin-pagination-info'>
            Halaman {page} dari {totalPages} · {fmtNum(total)} seller
          </div>
          <div className='admin-pagination-btns'>
            <button className='admin-page-btn' onClick={() => load(page - 1)} disabled={page <= 1 || loading}>← Prev</button>
            <span className='admin-page-btn admin-page-btn--active'>{page}</span>
            <button className='admin-page-btn' onClick={() => load(page + 1)} disabled={page >= totalPages || loading}>Next →</button>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <SellerDrawer
          sellerId={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => load(page)}
        />
      )}
    </AdminLayout>
  );
}
