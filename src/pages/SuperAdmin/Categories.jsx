import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

// Schema aktual: id, name, slug, description, status, created_at, product_count
const EMPTY = { name: '', slug: '', description: '', status: 'active' };

// Slug generator — sama dengan backend slugify
const toSlug = str =>
  String(str || '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');

export default function SuperAdminCategories() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(null);   // null = modal tutup
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);   // id yang sedang dikonfirmasi hapus
  const [msg,      setMsg]      = useState(null);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | active | inactive

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)           params.search = search;
      if (filter !== 'all') params.status = filter;
      const r = await api.get('/admin/categories', { params });
      setItems(r.data?.categories || []);
    } catch { setItems([]); }
    finally  { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  // ── Save (create / update) ────────────────────────────────────
  const save = async () => {
    const name = (form?.name || '').trim();
    const slug = (form?.slug || '').trim();
    if (!name) { setMsg({ type: 'error', text: 'Nama kategori wajib diisi.' }); return; }
    if (!slug) { setMsg({ type: 'error', text: 'Slug wajib diisi.' }); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setMsg({ type: 'error', text: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda -' });
      return;
    }
    setSaving(true); setMsg(null);
    try {
      const payload = { name, slug, description: form.description || '', status: form.status || 'active' };
      if (form.id) {
        await api.patch(`/admin/categories/${form.id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setMsg({ type: 'success', text: `Kategori berhasil ${form.id ? 'diperbarui' : 'ditambahkan'}.` });
      setForm(null);
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Gagal menyimpan kategori.' });
    } finally { setSaving(false); }
  };

  // ── Toggle status ─────────────────────────────────────────────
  const toggleStatus = async (cat) => {
    try {
      const r = await api.patch(`/admin/categories/${cat.id}/status`);
      const newStatus = r.data?.status || (cat.status === 'active' ? 'inactive' : 'active');
      setItems(prev => prev.map(c => c.id === cat.id ? { ...c, status: newStatus } : c));
      setMsg({ type: 'success', text: `Kategori "${cat.name}" ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.` });
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Gagal mengubah status.' });
    }
  };

  // ── Delete (Super Admin only — CATEGORY_MANAGE + requireSuperAdmin) ──
  const confirmDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      setMsg({ type: 'success', text: 'Kategori berhasil dihapus.' });
      setDeleting(null);
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Gagal menghapus kategori.' });
      setDeleting(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────
  const activeCount   = items.filter(c => c.status === 'active').length;
  const inactiveCount = items.filter(c => c.status === 'inactive').length;

  return (
    <AdminLayout title='Kategori Produk' subtitle='Kelola kategori yang tersedia untuk produk di marketplace.'>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Kategori', value: items.length,  color: '#22d3ee' },
          { label: 'Aktif',          value: activeCount,   color: '#10b981' },
          { label: 'Nonaktif',       value: inactiveCount, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className='card' style={{ padding: '14px 18px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        {/* Search */}
        <input
          className='admin-search'
          placeholder='Cari nama atau slug...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: 160, maxWidth: 320 }}
        />

        {/* Status filter */}
        <select
          className='admin-select'
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value='all'>Semua Status</option>
          <option value='active'>Aktif</option>
          <option value='inactive'>Nonaktif</option>
        </select>

        {/* Tambah kategori */}
        <button
          className='button small'
          style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)', padding: '8px 18px', fontWeight: 700, marginLeft: 'auto' }}
          onClick={() => { setForm({ ...EMPTY }); setMsg(null); }}
        >
          <i className='fa-solid fa-plus' style={{ marginRight: 8 }} />Tambah Kategori
        </button>
      </div>

      {/* ── Alert message ────────────────────────────────────────── */}
      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          fontWeight: 600, fontSize: '0.875rem',
          background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: msg.type === 'success' ? '#10b981' : '#ef4444',
        }}>
          <i className={`fa-solid ${msg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} style={{ marginRight: 8 }} />
          {msg.text}
          <button
            onClick={() => setMsg(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}
          >×</button>
        </div>
      )}

      {/* ── Category table ───────────────────────────────────────── */}
      <div className='card' style={{ padding: 0, overflow: 'hidden' }}>
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Nama</th>
                <th>Slug</th>
                <th>Deskripsi</th>
                <th style={{ textAlign: 'center', width: 70 }}>Produk</th>
                <th style={{ textAlign: 'center', width: 90 }}>Status</th>
                <th style={{ textAlign: 'right', width: 200 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  <i className='fa-solid fa-spinner fa-spin' style={{ marginRight: 8 }} />Memuat...
                </td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  {search || filter !== 'all' ? 'Tidak ada kategori yang cocok.' : 'Belum ada kategori. Tambahkan kategori pertama.'}
                </td></tr>
              )}
              {!loading && items.map((cat, idx) => (
                <tr key={cat.id}>
                  <td style={{ color: '#475569', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#f7f8ff' }}>{cat.name}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#22d3ee' }}>{cat.slug}</span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.82rem', maxWidth: 220 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description || <span style={{ color: '#475569' }}>—</span>}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 700, fontSize: '0.88rem',
                      color: (cat.product_count || 0) > 0 ? '#22d3ee' : '#475569',
                    }}>
                      {cat.product_count || 0}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {/* Status badge — klik untuk toggle */}
                    <button
                      title={cat.status === 'active' ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                      onClick={() => toggleStatus(cat)}
                      className={`admin-badge admin-badge--${cat.status === 'active' ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      <i className={`fa-solid fa-circle`} style={{ fontSize: '0.45rem', marginRight: 5, verticalAlign: 'middle' }} />
                      {cat.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {deleting === cat.id ? (
                      /* Confirm delete state */
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', whiteSpace: 'nowrap' }}>Hapus?</span>
                        <button
                          title='Konfirmasi hapus'
                          onClick={() => confirmDelete(cat.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 700,
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.35)',
                            color: '#ef4444',
                          }}
                        >
                          <i className='fa-solid fa-check' style={{ fontSize: '0.7rem' }} />
                          Ya
                        </button>
                        <button
                          title='Batal'
                          onClick={() => setDeleting(null)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                          }}
                        >
                          <i className='fa-solid fa-xmark' style={{ fontSize: '0.7rem' }} />
                          Batal
                        </button>
                      </div>
                    ) : (
                      /* Normal action buttons */
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Toggle Status */}
                        <button
                          title={cat.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          onClick={() => toggleStatus(cat)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                            background: cat.status === 'active'
                              ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                            border: cat.status === 'active'
                              ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(16,185,129,0.25)',
                            color: cat.status === 'active' ? '#f59e0b' : '#10b981',
                          }}
                        >
                          <i className={`fa-solid ${cat.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'}`} style={{ fontSize: '0.8rem' }} />
                          {cat.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        {/* Edit */}
                        <button
                          title='Edit kategori'
                          onClick={() => { setForm({ ...cat }); setMsg(null); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            color: '#818cf8',
                          }}
                        >
                          <i className='fa-solid fa-pen' style={{ fontSize: '0.75rem' }} />
                          Edit
                        </button>
                        {/* Delete */}
                        <button
                          title='Hapus kategori'
                          onClick={() => { setDeleting(cat.id); setMsg(null); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171',
                          }}
                        >
                          <i className='fa-solid fa-trash' style={{ fontSize: '0.75rem' }} />
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Form (Create / Edit) ─────────────────────────── */}
      {form && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setForm(null); setMsg(null); } }}
        >
          <div style={{ width: 'min(480px,95vw)', background: '#0d0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#f7f8ff', fontSize: '1.05rem' }}>
              <i className={`fa-solid ${form.id ? 'fa-pen' : 'fa-plus'}`} style={{ marginRight: 10, color: '#22d3ee' }} />
              {form.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>

            {msg && (
              <div style={{
                padding: '8px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.82rem', fontWeight: 600,
                background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: msg.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Nama */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  Nama Kategori <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className='admin-search'
                  type='text'
                  placeholder='Contoh: Mobile Legends'
                  value={form.name || ''}
                  onChange={e => {
                    const name = e.target.value;
                    // Auto-generate slug hanya saat create baru (belum ada ID)
                    setForm(p => ({ ...p, name, slug: p.id ? p.slug : toSlug(name) }));
                  }}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  Slug <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ marginLeft: 6, fontWeight: 400, color: '#475569' }}>(huruf kecil, angka, tanda -)</span>
                </label>
                <input
                  className='admin-search'
                  type='text'
                  placeholder='Contoh: mobile-legends'
                  value={form.slug || ''}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                  Deskripsi <span style={{ color: '#475569', fontWeight: 400 }}>(opsional)</span>
                </label>
                <textarea
                  className='admin-search'
                  rows={3}
                  placeholder='Deskripsi singkat kategori ini...'
                  value={form.description || ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Status</label>
                <select
                  className='admin-select'
                  style={{ width: '100%' }}
                  value={form.status || 'active'}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                >
                  <option value='active'>Aktif</option>
                  <option value='inactive'>Nonaktif</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
              <button
                className='button small'
                onClick={() => { setForm(null); setMsg(null); }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
              >
                Batal
              </button>
              <button
                className='button small'
                disabled={saving}
                onClick={save}
                style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)', fontWeight: 700, minWidth: 90 }}
              >
                {saving ? <><i className='fa-solid fa-spinner fa-spin' style={{ marginRight: 6 }} />Menyimpan…</> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
