import React, { useState } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import ImageUploadField from '../../components/common/ImageUploadField';
import { uploadImage } from '../../services/sellerService';
import api from '../../services/api';

export default function SellerProfile() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || user?.name || user?.username || '');
  const [phone, setPhone]       = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState(null);
  const [saving, setSaving]   = useState(false);

  const initials = (user?.username || 'S').charAt(0).toUpperCase();

  /* ── Avatar upload ── */
  const handleAvatarChange = async (file) => {
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
    setUploadingAvatar(true);
    try {
      const res = await uploadImage(file, 'avatars');
      const url = res.data?.data?.url || localUrl;
      setAvatarUrl(url);
      await api.patch(`/users/${user.id}/profile`, { avatar: url });
      updateUser({ avatar: url });
    } catch {
      // Tetap pakai preview lokal
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    updateUser({ avatar: '' });
    api.patch(`/users/${user.id}/profile`, { avatar: '' }).catch(() => {});
  };

  /* ── Simpan profil ── */
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/users/${user.id}/profile`, {
        full_name: fullName,
        phone,
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });
      updateUser({ full_name: fullName, phone, avatar: avatarUrl });
      setMessage({ type: 'success', text: 'Profil seller berhasil diperbarui!' });
    } catch {
      setMessage({ type: 'error', text: 'Gagal menyimpan perubahan.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Profil Seller</h1>
          <p style={{ color: '#94a3b8', margin: '6px 0 0', fontSize: '0.88rem' }}>
            Kelola foto profil dan informasi akun seller kamu.
          </p>
        </div>

        {/* Toast */}
        {message && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: message.type === 'success' ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(240px, 280px)', gap: 20, alignItems: 'flex-start' }}>
          {/* ── Form utama ── */}
          <div className='card' style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Avatar upload row */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 }}>
                <ImageUploadField
                  accept='image/*'
                  maxMB={3}
                  previewShape='circle'
                  previewUrl={avatarUrl}
                  uploading={uploadingAvatar}
                  onChange={handleAvatarChange}
                  onRemove={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  uploadLabel='Foto Profil'
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{fullName || user?.username}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 3 }}>@{user?.username}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>JPG, PNG, WEBP · maks. 3 MB</div>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.9rem' }}>Nama Lengkap</label>
                <input type='text' value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Username */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.9rem' }}>Username</label>
                  <input value={user?.username || ''} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'not-allowed', fontSize: '0.9rem' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, display: 'block' }}>Tidak dapat diubah</span>
                </div>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.9rem' }}>Email</label>
                  <input type='email' value={user?.email || ''} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'not-allowed', fontSize: '0.9rem' }} />
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.9rem' }}>Nomor WhatsApp / HP</label>
                <input type='text' value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='08123456789' style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem' }} />
              </div>

              <div>
                <button type='submit' disabled={saving || uploadingAvatar} className='button primary' style={{ padding: '10px 24px', borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {saving ? <><i className='fa-solid fa-spinner fa-spin' /><span>Menyimpan...</span></> : <><i className='fa-solid fa-floppy-disk' /><span>Simpan Perubahan</span></>}
                </button>
              </div>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div className='card' style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Avatar besar */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(139,92,246,0.4)', boxShadow: '0 8px 24px rgba(139,92,246,0.25)', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt='Avatar' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
                }
              </div>
              {uploadingAvatar && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='fa-solid fa-spinner fa-spin' style={{ color: '#fff', fontSize: '1.2rem' }} />
                </div>
              )}
            </div>

            <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{fullName || user?.username}</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 2 }}>@{user?.username}</div>
            <div style={{ display: 'inline-block', marginTop: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700 }}>Seller Aktif</div>

            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Role</span>
                <strong style={{ color: '#fff' }}>SELLER</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>2FA</span>
                <strong style={{ color: user?.two_factor_enabled ? '#10b981' : '#f59e0b' }}>
                  {user?.two_factor_enabled ? 'Aktif' : 'Belum'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
