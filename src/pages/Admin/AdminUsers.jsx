import React, { useEffect, useState, useCallback, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import * as adminService from '../../services/adminService';

/* ── Helpers ── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtNum  = (n) => Number(n || 0).toLocaleString('id-ID');

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  return <span className={`admin-badge admin-badge--${s}`}>{status || '—'}</span>;
}

function RoleBadge({ role }) {
  const s = String(role || '').toLowerCase();
  return <span className={`admin-badge admin-badge--${s}`}>{role || '—'}</span>;
}

/* ── Detail drawer ── */
function UserDrawer({ userId, onClose, onRefresh }) {
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy,   setBusy]   = useState(false);
  const [reason, setReason] = useState('');
  const [msg,    setMsg]    = useState(null);

  useEffect(() => {
    setLoading(true);
    setMsg(null);
    adminService.getUserDetail(userId)
      .then(r => setData(r.data))
      .catch(() => setMsg({ type: 'error', text: 'Gagal memuat detail user.' }))
      .finally(() => setLoading(false));
  }, [userId]);

  const action = async (fn, label) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ type: 'success', text: `${label} berhasil.` });
      onRefresh();
      // reload detail
      const r = await adminService.getUserDetail(userId);
      setData(r.data);
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || `${label} gagal.` });
    } finally {
      setBusy(false);
    }
  };

  const user = data?.user;
  const status = String(user?.account_status || '').toUpperCase();
  const isActive    = status === 'ACTIVE';
  const isSuspended = status === 'SUSPENDED' || status === 'BANNED' || status === 'INACTIVE';

  return (
    <div className='admin-drawer-backdrop' onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className='admin-drawer'>
        <div className='admin-drawer-header'>
          <div>
            <h2 className='admin-drawer-title'>Detail Pengguna</h2>
            {user && <p className='admin-drawer-sub'>ID #{user.id} · {user.email}</p>}
          </div>
          <button className='admin-drawer-close' onClick={onClose} aria-label='Tutup'>
            <i className='fa-solid fa-xmark' />
          </button>
        </div>

        <div className='admin-drawer-body'>
          {loading && <p className='admin-drawer-loading'>Memuat...</p>}

          {msg && (
            <div className={`admin-drawer-msg admin-drawer-msg--${msg.type}`}>
              <i className={`fa-solid ${msg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
              {msg.text}
            </div>
          )}

          {user && !loading && (
            <>
              {/* Profile */}
              <div className='admin-drawer-section'>
                <div className='admin-drawer-avatar'>
                  {user.avatar
                    ? <img src={user.avatar} alt='avatar' />
                    : <span>{(user.username || 'U').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <div className='admin-drawer-uname'>{user.full_name || user.username}</div>
                  <div className='admin-drawer-email'>@{user.username} · {user.email}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <StatusBadge status={user.account_status} />
                    <RoleBadge role={user.role} />
                    {user.email_verified && <span className='admin-badge admin-badge--active'>Email Verified</span>}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className='admin-drawer-grid'>
                {[
                  ['Nama Lengkap',  user.full_name || '—'],
                  ['Username',      user.username || '—'],
                  ['Email',         user.email || '—'],
                  ['Telepon',       user.phone || '—'],
                  ['Role',          user.role || '—'],
                  ['Status',        user.account_status || '—'],
                  ['Terdaftar',     fmtDate(user.created_at)],
                  ['Diperbarui',    fmtDate(user.updated_at)],
                ].map(([k, v]) => (
                  <div key={k} className='admin-drawer-kv'>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </div>

              {/* Orders summary */}
              {Array.isArray(data.orders) && (
                <div className='admin-drawer-section'>
                  <h3 className='admin-drawer-sec-title'>Pesanan ({data.orders.length})</h3>
                  {data.orders.length === 0
                    ? <p className='admin-drawer-empty'>Belum ada pesanan.</p>
                    : (
                      <div className='admin-table-wrap' style={{ maxHeight: 220, overflowY: 'auto' }}>
                        <table className='admin-table'>
                          <thead><tr><th>No. Pesanan</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead>
                          <tbody>
                            {data.orders.slice(0, 20).map(o => (
                              <tr key={o.id}>
                                <td>{o.order_number}</td>
                                <td>Rp {fmtNum(o.total_amount)}</td>
                                <td><StatusBadge status={o.order_status} /></td>
                                <td>{fmtDate(o.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  }
                </div>
              )}

              {/* Actions */}
              <div className='admin-drawer-section admin-drawer-actions'>
                <h3 className='admin-drawer-sec-title'>Aksi Akun</h3>

                {isActive && (
                  <>
                    <div className='admin-reason-row'>
                      <input
                        className='admin-search'
                        placeholder='Alasan (opsional)'
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                      />
                    </div>
                    <button
                      className='button small'
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                      disabled={busy}
                      onClick={() => action(() => adminService.suspendUser(user.id, reason), 'Suspend akun')}
                    >
                      <i className='fa-solid fa-ban' /> Suspend Akun
                    </button>
                  </>
                )}

                {isSuspended && (
                  <button
                    className='button small'
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                    disabled={busy}
                    onClick={() => action(() => adminService.restoreUser(user.id), 'Pulihkan akun')}
                  >
                    <i className='fa-solid fa-rotate-left' /> Pulihkan Akun
                  </button>
                )}

                <button
                  className='button small'
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                  disabled={busy}
                  onClick={() => action(() => adminService.forceLogoutUser(user.id), 'Force logout')}
                >
                  <i className='fa-solid fa-right-from-bracket' /> Force Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected,   setSelected]   = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', phone: '', role: 'BUYER' });
  const [createBusy, setCreateBusy] = useState(false);
  const [createMsg,  setCreateMsg]  = useState(null);
  const searchTimer = useRef(null);

  const load = useCallback(async (page = 1, q = search, role = roleFilter, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminService.listUsers({ page, limit: 20, search: q, role, status });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination || { page, limit: 20, total: 0, totalPages: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { load(1); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val, roleFilter, statusFilter), 400);
  };

  const handleFilter = (field, val) => {
    if (field === 'role')   { setRoleFilter(val);   load(1, search, val, statusFilter); }
    if (field === 'status') { setStatusFilter(val); load(1, search, roleFilter, val); }
  };

  // ── Create user handler ──────────────────────────────────────────────────
  const handleCreate = async () => {
    const { full_name, email, role } = createForm;
    if (!full_name.trim()) { setCreateMsg({ type: 'error', text: 'Nama lengkap wajib diisi.' }); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCreateMsg({ type: 'error', text: 'Email tidak valid.' }); return;
    }
    setCreateBusy(true); setCreateMsg(null);
    try {
      const res = await adminService.createUser(createForm);
      const link = res.data?.activation?.link;
      setCreateMsg({
        type: 'success',
        text: `Akun ${role} berhasil dibuat untuk ${email}.` +
              (link && link !== '(sent via email)' ? ` Link aktivasi: ${link}` : ' Email aktivasi telah dikirim.'),
      });
      setCreateForm({ full_name: '', email: '', phone: '', role: 'BUYER' });
      load(1);
    } catch (e) {
      setCreateMsg({ type: 'error', text: e?.response?.data?.message || 'Gagal membuat akun.' });
    } finally {
      setCreateBusy(false);
    }
  };

  const { page, limit, total, totalPages } = pagination;

  return (
    <AdminLayout
      title='Buyer Management'
      subtitle='Kelola akun pembeli — pantau aktivitas, ubah status, dan paksa logout.'
    >
      {/* Stats */}
      <div className='admin-stat-grid'>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#22d3ee' }}>{fmtNum(total)}</div>
          <div className='admin-stat-label'>Total Buyer</div>
        </div>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#10b981' }}>
            {fmtNum(users.filter(u => u.account_status === 'ACTIVE').length)}
          </div>
          <div className='admin-stat-label'>Aktif (halaman ini)</div>
        </div>
        <div className='admin-stat-card'>
          <div className='admin-stat-value' style={{ color: '#ef4444' }}>
            {fmtNum(users.filter(u => ['SUSPENDED','BANNED'].includes(u.account_status)).length)}
          </div>
          <div className='admin-stat-label'>Tersuspend</div>
        </div>
      </div>

      {/* Filter row */}
      <div className='admin-filter-row'>
        <input
          className='admin-search'
          placeholder='Cari nama, email, atau username...'
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <select className='admin-select' value={roleFilter} onChange={e => handleFilter('role', e.target.value)}>
          <option value=''>Semua Role</option>
          <option value='BUYER'>BUYER</option>
          <option value='USER'>USER</option>
          <option value='SELLER'>SELLER</option>
          <option value='ADMIN'>ADMIN</option>
        </select>
        <select className='admin-select' value={statusFilter} onChange={e => handleFilter('status', e.target.value)}>
          <option value=''>Semua Status</option>
          <option value='ACTIVE'>ACTIVE</option>
          <option value='INACTIVE'>INACTIVE</option>
          <option value='SUSPENDED'>SUSPENDED</option>
          <option value='BANNED'>BANNED</option>
        </select>
        <button className='button small' onClick={() => load(page)} disabled={loading}>
          {loading ? '...' : '↻ Refresh'}
        </button>
        <button
          className='button small'
          style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)', fontWeight: 700, marginLeft: 'auto' }}
          onClick={() => { setCreateModal(true); setCreateMsg(null); }}
        >
          <i className='fa-solid fa-user-plus' style={{ marginRight: 7 }} />Buat Akun
        </button>
      </div>

      {/* Table */}
      <div className='card' style={{ padding: 0, overflow: 'hidden' }}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama / Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Pesanan</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Memuat...</td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Tidak ada pengguna ditemukan.</td></tr>
              )}
              {!loading && users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>#{u.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f7f8ff' }}>{u.full_name || u.username}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>@{u.username}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td><StatusBadge status={u.account_status} /></td>
                  <td style={{ textAlign: 'center' }}>{fmtNum(u.order_count)}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <button
                      className='button small'
                      style={{ minHeight: 30, padding: '0 10px', fontSize: '0.78rem' }}
                      onClick={() => setSelected(u.id)}
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
            Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {fmtNum(total)} pengguna
          </div>
          <div className='admin-pagination-btns'>
            <button className='admin-page-btn' onClick={() => load(page - 1)} disabled={page <= 1 || loading}>← Prev</button>
            <span className='admin-page-btn admin-page-btn--active'>{page} / {totalPages}</span>
            <button className='admin-page-btn' onClick={() => load(page + 1)} disabled={page >= totalPages || loading}>Next →</button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <UserDrawer
          userId={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => load(page)}
        />
      )}

      {/* ── Modal Buat Akun (Super Admin only) ── */}
      {createModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
          onClick={e => { if (e.target === e.currentTarget) setCreateModal(false); }}
        >
          <div style={{ width: 'min(460px,95vw)', background: '#0d0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <h3 style={{ margin: '0 0 18px', color: '#f7f8ff', fontSize: '1.05rem' }}>
              <i className='fa-solid fa-user-plus' style={{ marginRight: 10, color: '#22d3ee' }} />
              Buat Akun Baru
            </h3>

            {createMsg && (
              <div style={{
                padding: '9px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.82rem', fontWeight: 600,
                background: createMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: createMsg.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${createMsg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                wordBreak: 'break-all',
              }}>
                <i className={`fa-solid ${createMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} style={{ marginRight: 7 }} />
                {createMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Tipe akun */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  Tipe Akun <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className='admin-select'
                  style={{ width: '100%' }}
                  value={createForm.role}
                  onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value='BUYER'>Buyer</option>
                  <option value='SELLER'>Seller</option>
                </select>
              </div>
              {/* Nama */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  Nama Lengkap <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className='admin-search' type='text' placeholder='Nama lengkap pengguna'
                  value={createForm.full_name}
                  onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className='admin-search' type='email' placeholder='email@example.com'
                  value={createForm.email}
                  onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  No. Telepon <span style={{ color: '#475569', fontWeight: 400 }}>(opsional)</span>
                </label>
                <input
                  className='admin-search' type='tel' placeholder='08xxxxxxxxxx'
                  value={createForm.phone}
                  onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                <i className='fa-solid fa-circle-info' style={{ marginRight: 5, color: '#475569' }} />
                Pengguna akan menerima email untuk mengatur password dan mengaktifkan akun. Password tidak pernah dibuat atau ditampilkan ke admin.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                className='button small'
                onClick={() => setCreateModal(false)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
              >Batal</button>
              <button
                className='button small'
                disabled={createBusy}
                onClick={handleCreate}
                style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)', fontWeight: 700, minWidth: 100 }}
              >
                {createBusy ? <><i className='fa-solid fa-spinner fa-spin' style={{ marginRight: 6 }} />Membuat…</> : 'Buat Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
