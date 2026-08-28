import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BuyerLayout from '../../layouts/BuyerLayout';
import * as orderService from '../../services/orderService';
import formatCurrency from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

/* ─── Icon badge helper (Supports PNG Image & FontAwesome fallback) ─ */
function IconBadge({ icon, image, color, bg, size = 44, imgSize = '72%' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: bg || `rgba(99,102,241,0.12)`,
        color: color || '#818cf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.15rem',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {image ? (
        <img
          src={image}
          alt=''
          style={{
            width: imgSize,
            height: imgSize,
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
          }}
        />
      ) : (
        <i className={icon} />
      )}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, image, color, bg, label, value, sublabel }) {
  return (
    <div
      className='card'
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <IconBadge icon={icon} image={image} color={color} bg={bg} size={48} imgSize='75%' />
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{sublabel}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    COMPLETED: { label: 'Selesai', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    DELIVERED: { label: 'Terkirim', bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
    PROCESSING: { label: 'Diproses', bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    PAID: { label: 'Dibayar', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    PENDING_PAYMENT: { label: 'Menunggu Bayar', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    CANCELLED: { label: 'Dibatalkan', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    DISPUTED: { label: 'Sengketa', bg: 'rgba(217,70,239,0.15)', color: '#d946ef' },
  };
  const b = map[status] || { label: status || 'Proses', bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' };
  return (
    <span
      style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 6,
        background: b.bg,
        color: b.color,
      }}
    >
      {b.label}
    </span>
  );
}

/* ─── Empty State ────────────────────────────────────────── */
function EmptyOrderState() {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          overflow: 'hidden',
        }}
      >
        <img
          src='/assets/total pesanan.png'
          alt='Empty orders'
          style={{ width: '65%', height: '65%', objectFit: 'contain' }}
        />
      </div>
      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>Belum ada transaksi</div>
      <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 340, margin: '8px auto 20px' }}>
        Kamu belum melakukan pemesanan apapun. Jelajahi marketplace dan temukan item game impianmu!
      </p>
      <Link to='/marketplace' className='button primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <i className='fa-solid fa-store' />
        <span>Mulai Belanja</span>
      </Link>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    orderService
      .getBuyerOrders()
      .then((res) => {
        if (!isMounted) return;
        const list = res?.orders || res?.data || [];
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setOrders([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ['PROCESSING', 'PAID'].includes(o.order_status)).length,
    pending: orders.filter((o) => o.order_status === 'PENDING_PAYMENT').length,
    completed: orders.filter((o) => ['COMPLETED', 'DELIVERED'].includes(o.order_status)).length,
  };

  const recentOrders = orders.slice(0, 5);

  const quickShortcuts = [
    {
      label: 'Semua Pesanan',
      desc: 'Lacak & kelola pesanan',
      to: '/buyer/orders',
      image: '/assets/semua pesanan.png',
      icon: 'fa-solid fa-box',
      color: '#818cf8',
      bg: 'rgba(99,102,241,0.12)',
    },
    {
      label: 'Wishlist',
      desc: 'Item yang kamu simpan',
      to: '/buyer/wishlist',
      image: '/assets/wishlist.png',
      icon: 'fa-solid fa-heart',
      color: '#fb7185',
      bg: 'rgba(244,63,94,0.12)',
    },
    {
      label: 'Pesan & Chat',
      desc: 'Komunikasi dengan seller',
      to: '/buyer/messages',
      image: '/assets/pesan & chat.png',
      icon: 'fa-solid fa-comments',
      color: '#38bdf8',
      bg: 'rgba(56,189,248,0.12)',
    },
    {
      label: 'Keamanan Akun',
      desc: 'Password & 2FA',
      to: '/buyer/settings',
      image: '/assets/keamanan akun.png',
      icon: 'fa-solid fa-shield-halved',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.12)',
    },
    {
      label: 'Profil Saya',
      desc: 'Edit data pribadi',
      to: '/buyer/profile',
      image: '/assets/profil saya.png',
      icon: 'fa-solid fa-circle-user',
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.12)',
    },
    {
      label: 'Notifikasi',
      desc: 'Update & pengumuman',
      to: '/buyer/notifications',
      image: '/assets/notifikasi.png',
      icon: 'fa-solid fa-bell',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.12)',
    },
  ];

  return (
    <BuyerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Hero Welcome Card ── */}
        <div
          className='card hero-welcome'
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(30,27,75,0.45) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 18,
            padding: '28px 32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  Halo, {user?.full_name || user?.username || 'Gamer'} 👋
                </h1>
                <span
                  style={{
                    background: 'rgba(99,102,241,0.22)',
                    color: '#818cf8',
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontWeight: 700,
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <i className='fa-solid fa-shield-halved' style={{ fontSize: '0.7rem' }} />
                  Buyer Dashboard
                </span>
              </div>
              <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.92rem', maxWidth: 500 }}>
                Pantau pesanan, kelola wishlist, dan komunikasi langsung dengan seller di GHub Marketplace.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                to='/marketplace'
                className='button primary'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                <i className='fa-solid fa-store' />
                <span>Jelajahi Marketplace</span>
              </Link>
              <Link
                to='/buyer/orders'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  transition: 'background 0.18s ease',
                }}
              >
                <i className='fa-solid fa-list-check' />
                <span>Pesanan Saya</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Row with custom asset icons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <StatCard
            image='/assets/total pesanan.png'
            icon='fa-solid fa-bag-shopping'
            color='#818cf8'
            bg='rgba(99,102,241,0.12)'
            label='Total Pesanan'
            value={loading ? '—' : stats.total}
            sublabel='Semua waktu'
          />
          <StatCard
            image='/assets/sedang di proses.png'
            icon='fa-solid fa-spinner'
            color='#38bdf8'
            bg='rgba(56,189,248,0.12)'
            label='Sedang Diproses'
            value={loading ? '—' : stats.active}
            sublabel='Menunggu pengiriman'
          />
          <StatCard
            image='/assets/menunggu bayar.png'
            icon='fa-solid fa-clock'
            color='#f59e0b'
            bg='rgba(245,158,11,0.12)'
            label='Menunggu Bayar'
            value={loading ? '—' : stats.pending}
            sublabel='Segera selesaikan'
          />
          <StatCard
            image='/assets/transaksi selesai.png'
            icon='fa-solid fa-circle-check'
            color='#10b981'
            bg='rgba(16,185,129,0.12)'
            label='Transaksi Selesai'
            value={loading ? '—' : stats.completed}
            sublabel='Berhasil diterima'
          />
        </div>

        {/* ── Quick Shortcuts with custom asset icons ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <i className='fa-solid fa-bolt' style={{ color: '#f59e0b', fontSize: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Akses Cepat</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {quickShortcuts.map((s, i) => (
              <Link
                key={i}
                to={s.to}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textDecoration: 'none',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconBadge
                  image={s.image}
                  icon={s.icon}
                  color={s.color}
                  bg={s.bg}
                  size={42}
                  imgSize='75%'
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Orders Section with 'pesan terbaru.png' icon ── */}
        <div
          className='card'
          style={{
            background: 'var(--surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconBadge
                image='/assets/pesan terbaru.png'
                icon='fa-solid fa-receipt'
                color='#818cf8'
                bg='rgba(99,102,241,0.12)'
                size={38}
                imgSize='75%'
              />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Pesanan Terbaru</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 1 }}>Riwayat transaksi terakhir di akunmu</div>
              </div>
            </div>
            {orders.length > 0 && (
              <Link to='/buyer/orders' style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 700 }}>
                Lihat Semua ({orders.length}) →
              </Link>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.6rem', color: '#6366f1', marginBottom: 10, display: 'block' }} />
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Memuat data pesanan...</div>
            </div>
          ) : recentOrders.length === 0 ? (
            <EmptyOrderState />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentOrders.map((o) => (
                <div
                  key={o.order_number || o.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    flexWrap: 'wrap',
                    gap: 12,
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <IconBadge
                      image='/assets/total pesanan.png'
                      icon='fa-solid fa-bag-shopping'
                      color='#818cf8'
                      bg='rgba(99,102,241,0.1)'
                      size={40}
                      imgSize='70%'
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>#{o.order_number}</span>
                        <StatusBadge status={o.order_status} />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 3 }}>
                        {o.product_name || 'Item Digital'}{o.game_name ? ` • ${o.game_name}` : ''}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                        {o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : 'Baru saja'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                        {formatCurrency(o.total_amount || 0)}
                      </div>
                    </div>
                    <Link
                      to={`/buyer/orders/${o.order_number}`}
                      className='button small'
                      style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <i className='fa-solid fa-eye' />
                      <span>Detail</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Marketplace Promo Banner ── */}
        <div
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '22px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'rgba(99,102,241,0.2)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              <i className='fa-solid fa-gamepad' />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>Ribuan Item Game Tersedia</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 3 }}>
                Top up, voucher, akun, jasa carry, dan banyak lagi!
              </div>
            </div>
          </div>
          <Link
            to='/marketplace'
            className='button primary'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              color: '#fff',
            }}
          >
            <i className='fa-solid fa-arrow-right' />
            <span>Jelajahi Sekarang</span>
          </Link>
        </div>

      </div>
    </BuyerLayout>
  );
}
