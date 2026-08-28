import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as sellerService from '../../services/sellerService';
import api from '../../services/api';

const DELIVERY_TYPES = ['instant', 'manual'];
const PRODUCT_TYPES  = ['item', 'account', 'currency', 'top-up', 'boosting', 'gift-card', 'service'];
const STATUSES       = [
  { value: 'active',  label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

const DEFAULT_FORM = {
  title:         '',
  description:   '',
  game_id:       '',
  category:      '',
  type:          'item',
  price:         '',
  stock:         '',
  delivery_type: 'instant',
  delivery_time: '',
  image:         '',
  status:        'active',
};

/**
 * ProductForm — handles both Create and Edit.
 *
 * Props:
 *   productId  — if provided, form is in Edit mode (fetches existing data)
 *   initial    — optional initial form values (used when parent already has the data)
 */
export default function ProductForm({ productId, initial }) {
  const navigate   = useNavigate();
  const isEdit     = Boolean(productId);

  const [form, setForm]       = useState(initial ? { ...DEFAULT_FORM, ...initial } : DEFAULT_FORM);
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit && !initial);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load game list for the dropdown
  useEffect(() => {
    api.get('/games')
      .then(r => {
        const list = r?.data?.data || r?.data?.games || r?.data || [];
        setGames(Array.isArray(list) ? list : []);
      })
      .catch(() => setGames([]));
  }, []);

  // In Edit mode: fetch existing product data
  useEffect(() => {
    if (!isEdit || initial) return;
    let mounted = true;
    setFetching(true);
    sellerService.getProduct(productId)
      .then(r => {
        if (!mounted) return;
        const p = r?.data?.data || r?.data || {};
        setForm({
          title:         p.title         || '',
          description:   p.description   || '',
          game_id:       p.game_id       || '',
          category:      p.category      || '',
          type:          p.type          || 'item',
          price:         p.price         != null ? String(p.price) : '',
          stock:         p.stock         != null ? String(p.stock) : '',
          delivery_type: p.delivery_type || 'instant',
          delivery_time: p.delivery_time || '',
          image:         p.image         || '',
          status:        p.status        || 'active',
        });
        if (p.image) setImagePreview(p.image);
      })
      .catch(() => setError('Gagal memuat data produk.'))
      .finally(() => { if (mounted) setFetching(false); });
    return () => { mounted = false; };
  }, [productId, isEdit, initial]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately to get URL
    try {
      setUploadingImage(true);
      const res = await sellerService.uploadImage(file, 'products');
      const url = res?.data?.url || res?.url || '';
      if (url) {
        set('image', url);
        setImagePreview(url);
      }
    } catch {
      setError('Upload gambar gagal. Anda bisa tetap simpan tanpa gambar.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    if (!form.title.trim())       return 'Nama produk wajib diisi.';
    if (!form.game_id)            return 'Game wajib dipilih.';
    if (!form.price || Number(form.price) < 0)  return 'Harga harus lebih dari atau sama dengan 0.';
    if (!form.stock || Number(form.stock) < 0)  return 'Stok harus lebih dari atau sama dengan 0.';
    return null;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const save = async (status = null) => {
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const payload = {
      ...form,
      price:   Number(form.price),
      stock:   Number(form.stock),
      game_id: Number(form.game_id),
      ...(status ? { status } : {}),
    };

    setLoading(true);
    try {
      if (isEdit) {
        await sellerService.updateProduct(productId, payload);
        setSuccess('Produk berhasil diperbarui.');
      } else {
        const res = await sellerService.createProduct(payload);
        setSuccess('Produk berhasil ditambahkan.');
        // Redirect to edit page so user can continue editing
        const newId = res?.data?.data?.id;
        if (newId) {
          setTimeout(() => navigate(`/seller/products/${newId}/edit`), 1200);
        }
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal menyimpan produk. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft        = () => save('inactive');
  const saveAndSubmit    = () => save('active');

  if (fetching) return <div className="card" style={{ marginTop: 12 }}>Memuat data produk...</div>;

  return (
    <div className="card" style={{ marginTop: 12 }}>
      {error   && <div className="error"   style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: 12 }}>{success}</div>}

      {/* Nama Produk */}
      <div style={{ marginBottom: 12 }}>
        <label>Nama Produk <span style={{ color: 'red' }}>*</span></label>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Contoh: Akun MLBB Rank Mythic"
          style={{ width: '100%', marginTop: 4 }}
        />
      </div>

      {/* Game */}
      <div style={{ marginBottom: 12 }}>
        <label>Game <span style={{ color: 'red' }}>*</span></label>
        <select
          value={form.game_id}
          onChange={e => set('game_id', e.target.value)}
          style={{ width: '100%', marginTop: 4 }}
        >
          <option value="">-- Pilih Game --</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Tipe & Kategori */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label>Tipe Produk</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} style={{ width: '100%', marginTop: 4 }}>
            {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Kategori</label>
          <input
            value={form.category}
            onChange={e => set('category', e.target.value)}
            placeholder="Contoh: accounts"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      </div>

      {/* Harga & Stok */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label>Harga (Rp) <span style={{ color: 'red' }}>*</span></label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={e => set('price', e.target.value)}
            placeholder="0"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
        <div>
          <label>Stok <span style={{ color: 'red' }}>*</span></label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={e => set('stock', e.target.value)}
            placeholder="0"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      </div>

      {/* Pengiriman */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label>Tipe Pengiriman</label>
          <select value={form.delivery_type} onChange={e => set('delivery_type', e.target.value)} style={{ width: '100%', marginTop: 4 }}>
            {DELIVERY_TYPES.map(d => <option key={d} value={d}>{d === 'instant' ? 'Instan' : 'Manual'}</option>)}
          </select>
        </div>
        <div>
          <label>Estimasi Pengiriman</label>
          <input
            value={form.delivery_time}
            onChange={e => set('delivery_time', e.target.value)}
            placeholder="Contoh: 5 menit"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      </div>

      {/* Status (edit only) */}
      {isEdit && (
        <div style={{ marginBottom: 12 }}>
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} style={{ width: '100%', marginTop: 4 }}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {/* Deskripsi */}
      <div style={{ marginBottom: 12 }}>
        <label>Deskripsi Produk</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
          placeholder="Jelaskan detail produk Anda..."
          style={{ width: '100%', marginTop: 4 }}
        />
      </div>

      {/* Gambar produk */}
      <div style={{ marginBottom: 16 }}>
        <label>Gambar Produk</label>
        <div style={{ marginTop: 4 }}>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }}
            />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {uploadingImage && <span className="muted" style={{ marginLeft: 8 }}>Mengupload...</span>}
          {form.image && !uploadingImage && (
            <div className="muted" style={{ marginTop: 4, fontSize: 12, wordBreak: 'break-all' }}>
              URL: {form.image}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="button cta-outline"
          onClick={saveDraft}
          disabled={loading || uploadingImage}
        >
          {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan sebagai Draft'}
        </button>
        {!isEdit && (
          <button
            className="button"
            onClick={saveAndSubmit}
            disabled={loading || uploadingImage}
          >
            {loading ? 'Mengirim...' : 'Kirim untuk Ditinjau'}
          </button>
        )}
        <button
          className="button cta-outline"
          onClick={() => navigate('/seller/products')}
          disabled={loading}
          style={{ marginLeft: 'auto' }}
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
