import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function BuyerLayout({ children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/buyer/dashboard', label: 'Dashboard',       icon: 'fa-solid fa-chart-pie',      end: true },
    { to: '/buyer/orders',    label: 'Pesanan Saya',    icon: 'fa-solid fa-box' },
    { to: '/buyer/wallet',    label: 'Dompet',          icon: 'fa-solid fa-wallet' },
    { to: '/buyer/wishlist',  label: 'Wishlist',        icon: 'fa-regular fa-heart' },
    { to: '/buyer/messages',  label: 'Pesan',           icon: 'fa-regular fa-comments' },
    { to: '/buyer/notifications', label: 'Notifikasi',  icon: 'fa-regular fa-bell' },
    { to: '/buyer/profile',   label: 'Profil Saya',     icon: 'fa-regular fa-user' },
    { to: '/buyer/settings',  label: 'Pengaturan & Keamanan', icon: 'fa-solid fa-gear' },
  ];

  return (
    <div className='buyer-layout-wrapper' style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className='container' style={{ flex: 1, padding: '24px 16px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        {/* Mobile Toggle Bar */}
        <div
          className='buyer-mobile-nav-bar'
          style={{
            display: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            background: 'var(--surface)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className='avatar'
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Buyer Account</div>
            </div>
          </div>

          <button
            type='button'
            className='button small'
            onClick={() => setMobileOpen((prev) => !prev)}
            style={{ padding: '6px 12px' }}
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} style={{ marginRight: 6 }} />
            Menu
          </button>
        </div>

        <div className='buyer-content-grid' style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <aside
            className={`buyer-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
            style={{
              width: 280,
              flexShrink: 0,
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* User Profile Card in Sidebar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                paddingBottom: 18,
                marginBottom: 16,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className='avatar'
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user?.full_name || user?.username}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  <span>{user?.role === 'SELLER' ? 'Seller' : 'Buyer'} Member</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#fff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)' : 'transparent',
                    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                    transition: 'all 0.18s ease',
                    textDecoration: 'none',
                  })}
                >
                  <i className={item.icon} style={{ width: 18, textAlign: 'center', fontSize: '1rem' }} />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0 6px' }} />

              <button
                type='button'
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  color: '#ef4444',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background 0.18s ease',
                }}
              >
                <i className='fa-solid fa-arrow-right-from-bracket' style={{ width: 18, textAlign: 'center', fontSize: '1rem' }} />
                <span>Keluar Akun</span>
              </button>
            </nav>
          </aside>

          {/* Main Body */}
          <main style={{ flex: 1, minWidth: 0, width: '100%' }}>
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
