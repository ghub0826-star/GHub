import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import './Legal.css';

const LEGAL_LINKS = [
  { to: '/terms', label: 'Syarat & Ketentuan' },
  { to: '/privacy', label: 'Kebijakan Privasi' },
  { to: '/refund-policy', label: 'Kebijakan Refund & Pembatalan' },
  { to: '/seller-agreement', label: 'Perjanjian Seller' },
  { to: '/buyer-protection', label: 'Perlindungan Pembeli' },
  { to: '/prohibited-products', label: 'Produk Terlarang' },
  { to: '/payment-policy', label: 'Kebijakan Pembayaran' },
  { to: '/dispute-resolution', label: 'Penyelesaian Sengketa' },
  { to: '/community-guidelines', label: 'Pedoman Komunitas' },
];

export default function LegalLayout({ title, lastUpdated, children }) {
  const { pathname } = useLocation();

  return (
    <div className='legal-page-wrapper'>
      <Header />
      <div className='container legal-page'>
        <div className='legal-layout'>
          {/* Sidebar nav */}
          <aside className='legal-sidebar' aria-label='Navigasi dokumen legal'>
            <div className='legal-sidebar-inner'>
              <h3 className='legal-sidebar-title'>Dokumen Legal</h3>
              <nav>
                <ul className='legal-nav-list'>
                  {LEGAL_LINKS.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`legal-nav-link${pathname === to ? ' active' : ''}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className='legal-main'>
            <article className='legal-card'>
              <header className='legal-header'>
                <div className='legal-badge'>Legal</div>
                <h1 className='legal-title'>{title}</h1>
                {lastUpdated && (
                  <p className='legal-meta'>
                    Terakhir diperbarui: <time dateTime={lastUpdated}>{lastUpdated}</time>
                  </p>
                )}
              </header>
              <div className='legal-body'>{children}</div>
            </article>

            {/* Back to top */}
            <div className='legal-back-row'>
              <Link to='/' className='legal-back-btn'>← Kembali ke Beranda</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
