import React from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../Header';

const NAV = [
  { to: '/admin/enterprise', label: 'Dashboard', icon: 'fa-gauge-high' },
  { to: '/admin/enterprise/tenants', label: 'Tenants', icon: 'fa-building' },
  { to: '/admin/enterprise/exchange-rates', label: 'Exchange Rates', icon: 'fa-money-bill-transfer' },
  { to: '/admin/enterprise/theme', label: 'Theme', icon: 'fa-palette' },
  { to: '/admin/enterprise/cms', label: 'CMS', icon: 'fa-file-lines' },
  { to: '/admin/enterprise/subscription', label: 'Subscription', icon: 'fa-crown' },
  { to: '/admin/enterprise/billing', label: 'Billing', icon: 'fa-credit-card' },
  { to: '/admin/enterprise/monitoring', label: 'Monitoring', icon: 'fa-heart-pulse' },
  { to: '/admin/enterprise/backup', label: 'Backup', icon: 'fa-database' },
  { to: '/admin/enterprise/audit', label: 'Audit', icon: 'fa-clipboard-list' },
  { to: '/admin/enterprise/features', label: 'Features', icon: 'fa-flag' },
  { to: '/admin/enterprise/whitelabel', label: 'White Label', icon: 'fa-tags' },
];

export default function EnterpriseLayout({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Navbar GHub (sama dengan halaman lain) ── */}
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 240,
          flexShrink: 0,
          background: '#0f0f23',
          padding: '20px 12px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 'var(--navbar-height, 76px)',
          height: 'calc(100vh - var(--navbar-height, 76px))',
          overflowY: 'auto',
        }}>
          <div style={{ fontWeight: 800, padding: '0 8px 16px', fontSize: '1.05rem', color: '#fff' }}>
            GHub Enterprise
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/admin/enterprise'}
                style={({ isActive }) => ({
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isActive ? 'rgba(108,92,231,0.2)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--muted)',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                })}
              >
                <i className={`fa-solid ${n.icon}`} style={{ width: 18 }} />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: 'auto' }}>
          {title && <h2 style={{ marginBottom: 20, fontWeight: 800, color: '#fff' }}>{title}</h2>}
          {children}
        </main>
      </div>
    </div>
  );
}
