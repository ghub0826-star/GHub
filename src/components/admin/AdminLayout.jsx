import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  // ── Shared (ADMIN + SUPER_ADMIN) ──────────────────────────────
  { to: '/admin/dashboard',          label: 'Dashboard',            icon: 'fa-gauge-high',           roles: ['ADMIN','SUPER_ADMIN'] },
  { to: '/admin/users',              label: 'Buyer Management',     icon: 'fa-users',                roles: ['ADMIN','SUPER_ADMIN'] },
  { to: '/admin/sellers',            label: 'Seller Management',    icon: 'fa-store',                roles: ['ADMIN','SUPER_ADMIN'] },
  { to: '/admin/disputes',           label: 'Disputes',             icon: 'fa-scale-balanced',       roles: ['ADMIN','SUPER_ADMIN'] },
  { to: '/admin/ai',                 label: 'AI Platform',          icon: 'fa-robot',                roles: ['ADMIN','SUPER_ADMIN'] },
  { to: '/admin/enterprise',         label: 'Enterprise',           icon: 'fa-building-columns',     roles: ['ADMIN','SUPER_ADMIN'] },

  // ── SUPER_ADMIN eksklusif ─────────────────────────────────────
  { divider: true,                   label: 'Super Admin',                                           roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/withdrawals',  label: 'Penarikan Dana',       icon: 'fa-money-bill-transfer',  roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/reports',      label: 'Laporan & Analitik',   icon: 'fa-chart-line',           roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/vouchers',     label: 'Voucher & Promo',      icon: 'fa-ticket',               roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/categories',   label: 'Kategori Produk',      icon: 'fa-layer-group',          roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/audit-logs',   label: 'Audit Log',            icon: 'fa-clipboard-list',       roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/admin-users',  label: 'Kelola Admin',         icon: 'fa-user-shield',          roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/kyc-review',   label: 'KYC Seller',           icon: 'fa-id-card',              roles: ['SUPER_ADMIN'] },
  { to: '/super-admin/settings',     label: 'Pengaturan Platform',  icon: 'fa-sliders',              roles: ['SUPER_ADMIN'] },
  { to: '/admin/enterprise/tenants', label: 'Tenants',              icon: 'fa-building',             roles: ['SUPER_ADMIN'] },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user } = useAuth();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const navigate = useNavigate();

  // Gunakan legacyRole sebagai safety net — backend lama bisa return 'ADMIN'
  // sementara nilai aslinya tersimpan di legacyRole
  const rawRole = user?.role || '';
  const legacyRole = String(user?.legacyRole || '').trim().toUpperCase();
  const isSuperAdmin =
    rawRole === 'SUPER_ADMIN' || legacyRole === 'SUPER_ADMIN';
  // Effective role untuk filter nav: jika SUPER_ADMIN gunakan 'SUPER_ADMIN'
  const role = isSuperAdmin ? 'SUPER_ADMIN' : rawRole;
  const visibleNav = NAV.filter(n => n.roles.includes(role));

  return (
    <div className='admin-layout-root'>
      <Header />
      <div className='admin-layout-body'>
        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar${mobileSidebar ? ' admin-sidebar--open' : ''}`}>
          <div className='admin-sidebar-brand'>
            <i className='fa-solid fa-shield-halved' />
            <span>Admin Panel</span>
          </div>

          <nav className='admin-sidebar-nav'>
            {visibleNav.map((n, idx) =>
              n.divider ? (
                <div key={`div-${idx}`} className='admin-nav-divider'>
                  <span>{n.label}</span>
                </div>
              ) : (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/admin/dashboard'}
                  onClick={() => setMobileSidebar(false)}
                  className={({ isActive }) =>
                    `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`
                  }
                >
                  <i className={`fa-solid ${n.icon} admin-nav-icon`} />
                  <span>{n.label}</span>
                </NavLink>
              )
            )}
          </nav>

          <div className='admin-sidebar-user'>
            <div className='admin-sidebar-avatar'>{(user?.username || 'A').charAt(0).toUpperCase()}</div>
            <div className='admin-sidebar-meta'>
              <div className='admin-sidebar-name'>{user?.username}</div>
              <div className='admin-sidebar-role'>{role}</div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className='admin-main'>
          {/* Mobile toggle */}
          <button
            className='admin-mobile-toggle'
            onClick={() => setMobileSidebar(v => !v)}
            aria-label='Toggle sidebar'
          >
            <i className={`fa-solid ${mobileSidebar ? 'fa-xmark' : 'fa-bars'}`} />
          </button>

          {(title || subtitle) && (
            <div className='admin-main-header'>
              {title  && <h1 className='admin-main-title'>{title}</h1>}
              {subtitle && <p className='admin-main-subtitle'>{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileSidebar && (
        <div
          className='admin-sidebar-overlay'
          onClick={() => setMobileSidebar(false)}
          aria-hidden='true'
        />
      )}
    </div>
  );
}
