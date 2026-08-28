import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(user?.full_name || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser({ full_name: fullName, phone });
      setSaving(false);
      setMessage({ type: 'success', text: 'Informasi akun berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    }, 400);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isSeller = user.role === 'SELLER';
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header />

      <div className='container' style={{ flex: 1, padding: '32px 16px', maxWidth: 1080, margin: '0 auto', width: '100%' }}>
        {/* Top Header Card */}
        <div
          className='card'
          style={{
            background: 'var(--surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '24px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {user.full_name || user.username}
                </h1>
                <span
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    color: '#818cf8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                  }}
                >
                  {user.role || 'USER'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                {user.email} • ID: #{user.id || '1'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to={isSeller ? '/seller/dashboard' : isAdmin ? '/admin/dashboard' : '/buyer/dashboard'}
              className='button primary'
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <i className='fa-solid fa-gauge' />
              <span>Buka Dashboard</span>
            </Link>

            <button
              type='button'
              onClick={handleLogout}
              className='button outline'
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <i className='fa-solid fa-arrow-right-from-bracket' style={{ marginRight: 6 }} />
              Keluar
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <i className='fa-solid fa-circle-check' />
            <span>{message.text}</span>
          </div>
        )}

        {/* Content Tabs & Panes */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'flex-start' }}>
          {/* Side Tabs */}
          <div
            className='card'
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {[
              { key: 'profile', label: 'Profil Akun', icon: 'fa-regular fa-user' },
              { key: 'security', label: 'Keamanan & Sandi', icon: 'fa-solid fa-shield-halved' },
              { key: 'preferences', label: 'Notifikasi & Preferensi', icon: 'fa-regular fa-bell' },
              { key: 'shortcuts', label: 'Pintasan Menu', icon: 'fa-solid fa-layer-group' },
            ].map((tab) => (
              <button
                key={tab.key}
                type='button'
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  background: activeTab === tab.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: activeTab === tab.key ? '#818cf8' : '#94a3b8',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <i className={tab.icon} style={{ width: 16, textAlign: 'center' }} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Pane */}
          <div
            className='card'
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 28,
            }}
          >
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>Informasi Profil</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '-10px 0 6px' }}>
                  Perbarui identitas dan kontak akun yang terdaftar.
                </p>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.88rem' }}>
                    Nama Lengkap
                  </label>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.88rem' }}>
                      Username
                    </label>
                    <input
                      type='text'
                      value={user.username}
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.88rem' }}>
                      Email
                    </label>
                    <input
                      type='email'
                      value={user.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.88rem' }}>
                    Nomor WhatsApp / Kontak
                  </label>
                  <input
                    type='text'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='08123456789'
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <button
                    type='submit'
                    disabled={saving}
                    className='button primary'
                    style={{ padding: '10px 22px', borderRadius: 8, fontWeight: 700 }}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>Keamanan & Autentikasi</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '-8px 0 8px' }}>
                  Lindungi akun Anda dengan fitur keamanan ganda dan proteksi sesi.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Kata Sandi (Password)</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                        Ganti password secara berkala untuk menjaga akun tetap aman.
                      </div>
                    </div>
                    <Link to='/buyer/settings/security' className='button small'>
                      Ubah Password
                    </Link>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Autentikasi Dua Faktor (2FA)</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                        Status: <strong style={{ color: user.two_factor_enabled ? '#10b981' : '#f59e0b' }}>
                          {user.two_factor_enabled ? 'Aktif' : 'Nonaktif'}
                        </strong>
                      </div>
                    </div>
                    <Link to='/buyer/settings/2fa' className='button small primary'>
                      Atur 2FA
                    </Link>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Perangkat & Sesi Login</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                        Lihat perangkat yang aktif dan riwayat login terbaru.
                      </div>
                    </div>
                    <Link to='/buyer/settings/devices' className='button small'>
                      Lihat Perangkat
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>Notifikasi & Preferensi</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '-8px 0 8px' }}>
                  Atur media notifikasi yang Anda inginkan saat bertransaksi.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Pengaturan Notifikasi Lengkap</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                        Sesuaikan notifikasi email, in-app, dan pesan order.
                      </div>
                    </div>
                    <Link to='/notifications/settings' className='button small primary'>
                      Buka Pengaturan
                    </Link>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Kotak Notifikasi</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                        Lihat daftar semua pesan dan notifikasi yang masuk.
                      </div>
                    </div>
                    <Link to='/notifications' className='button small'>
                      Lihat Notifikasi
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>Pintasan Menu Cepat</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '-8px 0 8px' }}>
                  Akses instan ke fitur-fitur marketplace yang sering digunakan.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <Link to='/buyer/dashboard' className='card' style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, textDecoration: 'none', color: '#fff' }}>
                    <i className='fa-solid fa-chart-pie' style={{ color: '#6366f1', fontSize: '1.2rem', marginBottom: 8 }} />
                    <div style={{ fontWeight: 700 }}>Buyer Dashboard</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Ringkasan transaksi</div>
                  </Link>

                  <Link to='/buyer/orders' className='card' style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, textDecoration: 'none', color: '#fff' }}>
                    <i className='fa-solid fa-box' style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: 8 }} />
                    <div style={{ fontWeight: 700 }}>Pesanan Saya</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Riwayat belanja</div>
                  </Link>

                  <Link to='/buyer/wishlist' className='card' style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, textDecoration: 'none', color: '#fff' }}>
                    <i className='fa-regular fa-heart' style={{ color: '#ec4899', fontSize: '1.2rem', marginBottom: 8 }} />
                    <div style={{ fontWeight: 700 }}>Wishlist</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Item favorit</div>
                  </Link>

                  <Link to='/buyer/messages' className='card' style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, textDecoration: 'none', color: '#fff' }}>
                    <i className='fa-regular fa-comments' style={{ color: '#10b981', fontSize: '1.2rem', marginBottom: 8 }} />
                    <div style={{ fontWeight: 700 }}>Pesan & Chat</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Chat dengan seller</div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
