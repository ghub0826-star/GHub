import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import * as orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import SellerOrders from './Orders';
import SellerMessages from './Messages';
import Header from '../../components/Header';
import formatCurrency from '../../utils/formatCurrency';

/* ─── Helpers ─────────────────────────────────────────── */
function IconBox({ icon, color, bg, size = 44, fontSize = '1.1rem' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: bg || 'rgba(99,102,241,0.12)',
        color: color || '#818cf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        flexShrink: 0,
      }}
    >
      <i className={icon} />
    </div>
  );
}

function StatCard({ icon, color, bg, label, value, sublabel, loading }) {
  return (
    <div
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
      <IconBox icon={icon} color={color} bg={bg} />
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
          {loading ? <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1rem', color: '#6366f1' }} /> : value}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

/* ─── Overview ────────────────────────────────────────── */
function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    // Fetch KYC status tanpa blocking dashboard load
    api.get('/seller/kyc/status').then(r => setKycStatus(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      orderService.getSellerOrders(),
      api.get('/wallet/balance').catch(() => null),
      api.get('/wallet/transactions?limit=5').catch(() => null),
    ]).then(([ordersResult, walletResult, txResult]) => {
      if (!mounted) return;

      const rawOrders = ordersResult.status === 'fulfilled'
        ? (ordersResult.value?.orders || ordersResult.value?.data || [])
        : [];
      const orderList = Array.isArray(rawOrders) ? rawOrders : [];

      const wallet = walletResult.status === 'fulfilled' ? walletResult.value?.data?.data : null;
      const transactions = txResult.status === 'fulfilled' ? (txResult.value?.data?.data || []) : [];

      const pendingProcess = orderList.filter((o) => o.order_status === 'PAID').length;
      const shipping = orderList.filter((o) => ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.order_status)).length;
      const completed = orderList.filter((o) => o.order_status === 'COMPLETED').length;
      const disputed = orderList.filter((o) => o.order_status === 'DISPUTED').length;
      const totalRevenue = orderList
        .filter((o) => ['COMPLETED', 'DELIVERED'].includes(o.order_status))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Compute average delivery time — no hardcoded fallback
      let totalDeliverySeconds = 0;
      let deliveryCount = 0;
      orderList.forEach((o) => {
        if (o.shipping_started_at && o.shipping_completed_at) {
          const diff = Math.floor((new Date(o.shipping_completed_at) - new Date(o.shipping_started_at)) / 1000);
          if (diff > 0) {
            totalDeliverySeconds += diff;
            deliveryCount += 1;
          }
        }
      });
      let avgDeliveryFormatted = '—';
      if (deliveryCount > 0) {
        const avg = Math.floor(totalDeliverySeconds / deliveryCount);
        const m = Math.floor(avg / 60);
        const s = avg % 60;
        avgDeliveryFormatted = `${m}m ${s}s`;
      }

      setStats({
        totalOrders: orderList.length,
        pendingProcess,
        shippingOrders: shipping,
        completedOrders: completed,
        disputedOrders: disputed,
        avgDeliveryTime: avgDeliveryFormatted,
        totalRevenue,
        walletBalance:      wallet?.available_balance ?? null,
        walletHeld:         wallet?.held_balance      ?? null,
        walletTransactions: transactions,
      });
      setRecentOrders(orderList.slice(0, 5));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const quickLinks = [
    { to: '../products', icon: 'fa-solid fa-box-open', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', label: 'Produk Saya', desc: 'Kelola listing' },
    { to: '../orders', icon: 'fa-solid fa-receipt', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', label: 'Pesanan Masuk', desc: 'Proses & kirim' },
    { to: '../messages', icon: 'fa-solid fa-comments', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Pesan Buyer', desc: 'Chat & negosiasi' },
    { to: '../wallet', icon: 'fa-solid fa-wallet', color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Dompet', desc: 'Saldo & penarikan' },
    { to: '../analytics', icon: 'fa-solid fa-chart-line', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', label: 'Analitik Toko', desc: 'Performa & grafik' },
    { to: '../settings', icon: 'fa-solid fa-gear', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Pengaturan', desc: 'Konfigurasi toko' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── KYC Identity Verification Banner ── */}
      {kycStatus && kycStatus.kyc_status !== 'VERIFIED' && (() => {
        const s = kycStatus.kyc_status || 'NOT_SUBMITTED';
        const cfg = {
          NOT_SUBMITTED: { icon:'fa-id-card',       color:'#f59e0b', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.2)',  title:'Verifikasi Identitas Diperlukan',     desc:'Upload KTP dan foto selfie untuk mengaktifkan penarikan dana.' },
          PENDING:       { icon:'fa-clock',          color:'#22d3ee', bg:'rgba(34,211,238,0.07)', border:'rgba(34,211,238,0.2)',  title:'Dokumen Sedang Diperiksa',            desc:'Tim kami akan memverifikasi dalam 1–3 hari kerja. Anda tetap dapat menggunakan akun.' },
          REJECTED:      { icon:'fa-circle-xmark',   color:'#ef4444', bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)',   title:'Verifikasi Ditolak',                  desc:`Alasan: ${kycStatus.rejection_reason || 'Dokumen tidak valid.'}. Kirim ulang dokumen yang benar.` },
        }[s];
        if (!cfg) return null;
        return (
          <div style={{ padding:'14px 18px', borderRadius:12, background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <i className={`fa-solid ${cfg.icon}`} style={{ color:cfg.color, fontSize:'1.2rem' }} />
              <div>
                <div style={{ fontWeight:700, color:cfg.color, fontSize:'0.9rem' }}>{cfg.title}</div>
                <div style={{ color:'#94a3b8', fontSize:'0.78rem', marginTop:2 }}>{cfg.desc}</div>
              </div>
            </div>
            {s !== 'PENDING' && (
              <a href='/seller/verification' style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:9, textDecoration:'none', fontWeight:700, fontSize:'0.8rem', background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color }}>
                <i className='fa-solid fa-arrow-right' />
                {s === 'REJECTED' ? 'Kirim Ulang' : 'Verifikasi Sekarang'}
              </a>
            )}
          </div>
        );
      })()}

      {/* ── Hero Welcome ── */}
      <div
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
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Selamat datang, {user?.full_name || user?.username || 'Seller'} 🎮
              </h1>
              <span
                style={{
                  background: 'rgba(16,185,129,0.2)',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontWeight: 700,
                  border: '1px solid rgba(16,185,129,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <i className='fa-solid fa-store' style={{ fontSize: '0.7rem' }} />
                Seller Dashboard
              </span>
            </div>
            <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.92rem' }}>
              Pantau pesanan, kelola produk, dan tingkatkan performa toko Anda di GHub Marketplace.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to='../products'
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff', padding: '10px 18px', borderRadius: 10, fontWeight: 600,
                textDecoration: 'none', fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              <i className='fa-solid fa-plus' />
              <span>Tambah Produk</span>
            </Link>
            <Link
              to='../orders'
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0',
                textDecoration: 'none', fontSize: '0.9rem',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <i className='fa-solid fa-receipt' />
              <span>Lihat Pesanan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard
          icon='fa-solid fa-hourglass-start'
          color='#60a5fa' bg='rgba(59,130,246,0.12)'
          label='Menunggu Diproses' loading={loading}
          value={stats?.pendingProcess ?? '—'}
          sublabel='Pesanan sudah dibayar'
        />
        <StatCard
          icon='fa-solid fa-truck-fast'
          color='#facc15' bg='rgba(234,179,8,0.12)'
          label='Sedang Dikirim' loading={loading}
          value={stats?.shippingOrders ?? '—'}
          sublabel='Dalam proses delivery'
        />
        <StatCard
          icon='fa-solid fa-circle-check'
          color='#4ade80' bg='rgba(34,197,94,0.12)'
          label='Pesanan Selesai' loading={loading}
          value={stats?.completedOrders ?? '—'}
          sublabel='Dikonfirmasi buyer'
        />
        <StatCard
          icon='fa-solid fa-triangle-exclamation'
          color='#fb923c' bg='rgba(249,115,22,0.12)'
          label='Pesanan Bermasalah' loading={loading}
          value={stats?.disputedOrders ?? '0'}
          sublabel='Perlu penanganan'
        />
        <StatCard
          icon='fa-solid fa-stopwatch'
          color='#38bdf8' bg='rgba(56,189,248,0.12)'
          label='Rata-rata Pengiriman' loading={loading}
          value={stats?.avgDeliveryTime ?? '—'}
          sublabel='Waktu respon & kirim'
        />
        <StatCard
          icon='fa-solid fa-sack-dollar'
          color='#34d399' bg='rgba(52,211,153,0.12)'
          label='Total Pendapatan' loading={loading}
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          sublabel='Dari transaksi selesai'
        />
      </div>

      {/* ── Quick Links ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <i className='fa-solid fa-bolt' style={{ color: '#f59e0b', fontSize: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Akses Cepat</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {quickLinks.map((s) => (
            <Link
              key={s.to}
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
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: s.bg,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                <i className={s.icon} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconBox icon='fa-solid fa-receipt' color='#818cf8' bg='rgba(99,102,241,0.12)' size={36} fontSize='0.95rem' />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Pesanan Terbaru</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 1 }}>Pesanan masuk terbaru ke tokomu</div>
            </div>
          </div>
          {recentOrders.length > 0 && (
            <Link to='../orders' style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 700 }}>
              Lihat Semua →
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.6rem', color: '#6366f1', display: 'block', marginBottom: 10 }} />
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Memuat data pesanan...</div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.8rem',
                color: '#6366f1',
              }}
            >
              <i className='fa-solid fa-box-open' />
            </div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Belum ada pesanan masuk</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 340, margin: '8px auto 20px' }}>
              Tambahkan produk ke tokomu agar pembeli dapat menemukan dan memesan produkmu!
            </p>
            <Link to='../products' style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9, background: 'rgba(99,102,241,0.2)', color: '#818cf8', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              <i className='fa-solid fa-plus' />
              <span>Tambah Produk Pertama</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentOrders.map((o) => (
              <div
                key={o.sub_order_number || o.order_number || o.id}
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <IconBox icon='fa-solid fa-bag-shopping' color='#818cf8' bg='rgba(99,102,241,0.1)' size={40} fontSize='1rem' />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      #{o.sub_order_number || o.order_number}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      <i className='fa-regular fa-calendar' style={{ marginRight: 4 }} />
                      {o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : 'Baru saja'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#fff' }}>{formatCurrency(o.total_amount || 0)}</div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: o.order_status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: o.order_status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {o.order_status || 'PENDING'}
                    </span>
                  </div>
                  <Link
                    to={`../orders/${o.sub_order_number || o.order_number}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'rgba(99,102,241,0.15)',
                      color: '#818cf8',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
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
    </div>
  );
}

/* ─── My Store ────────────────────────────────────────── */
function MyStore() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/profile').then((res) => {
      setStore(res.data);
    }).catch(() => {
      setStore(null);
    }).finally(() => setLoading(false));
  }, []);

  const fields = [
    { icon: 'fa-solid fa-store', label: 'Nama Toko', value: store?.shop_name || store?.store_name },
    { icon: 'fa-solid fa-id-card', label: 'Username', value: store?.username || user?.username },
    { icon: 'fa-regular fa-envelope', label: 'Email', value: store?.email || user?.email },
    { icon: 'fa-solid fa-phone', label: 'Nomor Telepon', value: store?.phone_number || '—' },
    { icon: 'fa-solid fa-circle', label: 'Status Toko', value: store?.is_online ? 'Online' : 'Offline' },
    { icon: 'fa-solid fa-star', label: 'Rating Toko', value: store?.rating ? `${store.rating} / 5.0` : 'Belum ada rating' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-store' color='#818cf8' bg='rgba(99,102,241,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Toko Saya</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Informasi profil toko Anda</div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
          <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.5rem', color: '#6366f1', display: 'block', marginBottom: 8 }} />
          Memuat data toko...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {fields.map((f) => (
            <div key={f.label} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <IconBox icon={f.icon} color='#818cf8' bg='rgba(99,102,241,0.1)' size={38} fontSize='0.95rem' />
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{f.label}</div>
                <div style={{ fontWeight: 700, color: '#fff', marginTop: 3 }}>{f.value || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !store && (
        <div style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <i className='fa-solid fa-store' style={{ fontSize: '2rem', color: '#6366f1', display: 'block', marginBottom: 12 }} />
          <div style={{ fontWeight: 700, color: '#fff' }}>Toko belum terdaftar</div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px auto 20px', maxWidth: 360 }}>
            Lengkapi pendaftaran toko Anda untuk mulai berjualan di GHub Marketplace.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Products ────────────────────────────────────────── */
function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '', category: '', delivery_type: '', delivery_time: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        seller_id: user?.id,
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      };
      const response = await api.get('/products', { params });
      const list = Array.isArray(response.data?.products)
        ? response.data.products
        : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [user]);

  const resetForm = () => {
    setForm({ title: '', description: '', price: '', stock: '', category: '', delivery_type: '', delivery_time: '' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.price) return;
    if (editingId) {
      await api.put(`/products/${editingId}`, { ...form, price: Number(form.price), stock: Number(form.stock) });
    } else {
      await api.post('/products', { ...form, seller_id: user?.id, price: Number(form.price), stock: Number(form.stock), status: 'active' });
    }
    resetForm();
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ title: product.title, description: product.description, price: product.price, stock: product.stock, category: product.category, delivery_type: product.delivery_type, delivery_time: product.delivery_time });
  };

  const handleDelete = async (product) => {
    await api.delete(`/products/${product.id}`);
    loadProducts();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-box-open' color='#38bdf8' bg='rgba(56,189,248,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Produk Saya</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Kelola seluruh listing produk tokomu</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <i className={`fa-solid ${editingId ? 'fa-pen' : 'fa-plus-circle'}`} style={{ color: '#818cf8' }} />
          <h3 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { field: 'title', placeholder: 'Judul produk', label: 'Judul', icon: 'fa-solid fa-tag' },
            { field: 'price', placeholder: 'Harga (Rp)', label: 'Harga', icon: 'fa-solid fa-coins', type: 'number' },
            { field: 'stock', placeholder: 'Stok tersedia', label: 'Stok', icon: 'fa-solid fa-cubes', type: 'number' },
            { field: 'category', placeholder: 'Kategori game', label: 'Kategori', icon: 'fa-solid fa-gamepad' },
            { field: 'delivery_type', placeholder: 'Manual / Otomatis', label: 'Tipe Pengiriman', icon: 'fa-solid fa-truck' },
            { field: 'delivery_time', placeholder: 'Estimasi waktu', label: 'Waktu Kirim', icon: 'fa-solid fa-clock' },
          ].map(({ field, placeholder, label, icon, type }) => (
            <div key={field}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <i className={icon} style={{ color: '#6366f1' }} /> {label}
              </label>
              <input
                type={type || 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={placeholder}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <i className='fa-solid fa-align-left' style={{ color: '#6366f1' }} /> Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder='Deskripsi produk...'
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className='button primary'
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <i className={`fa-solid ${editingId ? 'fa-floppy-disk' : 'fa-plus'}`} />
            <span>{editingId ? 'Simpan Perubahan' : 'Buat Produk'}</span>
          </button>
          {editingId && (
            <button className='button secondary' onClick={resetForm} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <i className='fa-solid fa-xmark' />
              <span>Batal</span>
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <i className='fa-solid fa-magnifying-glass' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari produk...'
              style={{ paddingLeft: 36, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', padding: '8px 12px' }}
          >
            <option value='active'>Aktif</option>
            <option value='deleted'>Dihapus</option>
            <option value=''>Semua</option>
          </select>
          <button className='button small' onClick={loadProducts} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className='fa-solid fa-rotate' />
            <span>Cari</span>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
            <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.4rem', color: '#6366f1', display: 'block', marginBottom: 8 }} />
            Memuat produk...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <i className='fa-solid fa-box-open' style={{ fontSize: '2rem', color: '#6366f1', display: 'block', marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: '#fff' }}>Belum ada produk</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px auto', maxWidth: 320 }}>
              Tambahkan produk pertamamu menggunakan form di atas.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map((product) => (
              <div
                key={product.id}
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconBox icon='fa-solid fa-box' color='#38bdf8' bg='rgba(56,189,248,0.1)' size={40} fontSize='1rem' />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{product.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      <i className='fa-solid fa-coins' style={{ marginRight: 4, color: '#f59e0b' }} />
                      {formatCurrency(product.price)} •
                      <i className='fa-solid fa-cubes' style={{ margin: '0 4px', color: '#818cf8' }} />
                      Stok: {product.stock}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className='button small'
                    onClick={() => handleEdit(product)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <i className='fa-solid fa-pen' />
                    <span>Edit</span>
                  </button>
                  <button
                    className='button small'
                    onClick={() => handleDelete(product)}
                    style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <i className='fa-solid fa-trash' />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Delivery ────────────────────────────────────────── */
function Delivery() {
  const [orderNumber, setOrderNumber] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitProof = async () => {
    if (!orderNumber || !proofUrl) {
      setMessage('Order number dan bukti pengiriman wajib diisi');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/delivery/proof', { order_number: orderNumber, proof_url: proofUrl });
      setMessage(`Bukti pengiriman berhasil diunggah untuk pesanan ${response.data.order.order_number}`);
      setOrderNumber('');
      setProofUrl('');
    } catch {
      setMessage('Gagal mengunggah bukti pengiriman. Periksa nomor pesanan dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-truck' color='#a78bfa' bg='rgba(167,139,250,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Upload Bukti Pengiriman</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Konfirmasi pengiriman produk ke buyer</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Nomor Pesanan', value: orderNumber, onChange: setOrderNumber, placeholder: '#ORD-XXXXXX', icon: 'fa-solid fa-hashtag' },
          { label: 'URL Bukti Pengiriman', value: proofUrl, onChange: setProofUrl, placeholder: 'https://...', icon: 'fa-solid fa-link' },
        ].map(({ label, value, onChange, placeholder, icon }) => (
          <div key={label}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <i className={icon} style={{ color: '#6366f1' }} /> {label}
            </label>
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#fff', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <button
          className='button primary'
          onClick={submitProof}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
        >
          {loading
            ? <><i className='fa-solid fa-circle-notch fa-spin' /><span>Mengunggah...</span></>
            : <><i className='fa-solid fa-cloud-arrow-up' /><span>Upload Bukti</span></>
          }
        </button>

        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: 9,
            background: message.includes('berhasil') ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${message.includes('berhasil') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('berhasil') ? '#10b981' : '#ef4444',
            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className={`fa-solid ${message.includes('berhasil') ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Reviews ─────────────────────────────────────────── */
function Reviews() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-star' color='#f59e0b' bg='rgba(245,158,11,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Ulasan Toko</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Penilaian dan komentar dari pembeli</div>
        </div>
      </div>
      <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <i className='fa-regular fa-star' style={{ fontSize: '2.5rem', color: '#f59e0b', display: 'block', marginBottom: 14 }} />
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>Belum ada ulasan</div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px auto', maxWidth: 360 }}>
          Ulasan akan muncul setelah pembeli menyelesaikan transaksi dan memberikan penilaian.
        </p>
      </div>
    </div>
  );
}

/* ─── Wallet ──────────────────────────────────────────── */
function Wallet() {
  const [wallet,         setWallet]         = useState(null);
  const [transactions,   setTransactions]   = useState([]);
  const [kycStatus,      setKycStatus]      = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo,       setBankInfo]       = useState({ bank_name: '', account_number: '', account_name: '' });
  const [message,        setMessage]        = useState('');
  const [msgType,        setMsgType]        = useState('success');

  useEffect(() => {
    Promise.allSettled([
      api.get('/wallet/balance').catch(() => null),
      api.get('/wallet/transactions?limit=10').catch(() => null),
      api.get('/seller/kyc/status').catch(() => null),
    ]).then(([walletRes, txRes, kycRes]) => {
      if (walletRes.status === 'fulfilled' && walletRes.value)
        setWallet(walletRes.value.data?.data || walletRes.value.data || null);
      if (txRes.status === 'fulfilled' && txRes.value)
        setTransactions(txRes.value.data?.data || []);
      if (kycRes.status === 'fulfilled' && kycRes.value)
        setKycStatus(kycRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const isKycVerified = kycStatus?.kyc_status === 'VERIFIED';

  const requestWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) < 10000) {
      setMsgType('error'); setMessage('Minimal penarikan Rp 10.000'); return;
    }
    try {
      const response = await api.post('/wallet/withdraw', {
        amount: Number(withdrawAmount),
        bank_info: bankInfo,
      });
      setMsgType('success');
      setMessage(response.data.message || 'Permintaan penarikan berhasil dikirim');
      setWithdrawAmount('');
      setBankInfo({ bank_name: '', account_number: '', account_name: '' });
    } catch (e) {
      setMsgType('error');
      setMessage(e?.response?.data?.message || 'Gagal melakukan permintaan penarikan. Pastikan saldo mencukupi.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.6rem', color: '#6366f1', display: 'block', marginBottom: 10 }} />
        <div style={{ color: '#64748b' }}>Memuat data dompet...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-wallet' color='#34d399' bg='rgba(52,211,153,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Dompet Seller</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Saldo dan riwayat transaksi keuangan</div>
        </div>
      </div>

      {!wallet ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <i className='fa-solid fa-wallet' style={{ fontSize: '2rem', color: '#34d399', display: 'block', marginBottom: 12 }} />
          <div style={{ fontWeight: 700, color: '#fff' }}>Dompet belum aktif</div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px auto', maxWidth: 360 }}>
            Saldo kamu akan muncul di sini setelah transaksi pertama selesai.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <StatCard icon='fa-solid fa-sack-dollar' color='#34d399' bg='rgba(52,211,153,0.12)' label='Saldo Tersedia' value={formatCurrency(wallet.available_balance || 0)} sublabel='Siap ditarik' />
            <StatCard icon='fa-solid fa-lock' color='#f59e0b' bg='rgba(245,158,11,0.12)' label='Saldo Ditahan' value={formatCurrency(wallet.held_balance || 0)} sublabel='Menunggu konfirmasi' />
          </div>

          {/* Withdraw */}
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className='fa-solid fa-arrow-up-from-bracket' style={{ color: '#34d399' }} />
              Request Penarikan Dana
            </div>

            {/* KYC gate — tampilkan jika belum verified */}
            {!isKycVerified && (
              <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', gap:12 }}>
                <i className='fa-solid fa-lock' style={{ color:'#f59e0b', fontSize:'1.1rem' }} />
                <div style={{ flex:1 }}>
                  <div style={{ color:'#f59e0b', fontWeight:700, fontSize:'0.85rem' }}>Verifikasi Identitas Diperlukan</div>
                  <div style={{ color:'#94a3b8', fontSize:'0.75rem', marginTop:2 }}>
                    Penarikan dana memerlukan verifikasi KTP dan selfie. Status saat ini: <strong style={{ color:'#f59e0b' }}>{kycStatus?.kyc_status || 'BELUM DISUBMIT'}</strong>
                  </div>
                </div>
                <a href='/seller/verification' style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:8, textDecoration:'none', fontSize:'0.78rem', fontWeight:700, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b', whiteSpace:'nowrap' }}>
                  <i className='fa-solid fa-id-card' /> Verifikasi
                </a>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type='number'
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder='Nominal penarikan (Rp)'
                disabled={!isKycVerified}
                style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', opacity: isKycVerified ? 1 : 0.5 }}
              />
              <button
                className='button primary'
                onClick={requestWithdraw}
                disabled={!isKycVerified}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, opacity: isKycVerified ? 1 : 0.4, cursor: isKycVerified ? 'pointer' : 'not-allowed' }}
              >
                <i className='fa-solid fa-paper-plane' />
                <span>Tarik</span>
              </button>
            </div>
            {message && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: msgType === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: msgType === 'success' ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.88rem' }}>
                {message}
              </div>
            )}
          </div>

          {/* Transactions */}
          {transactions && transactions.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className='fa-solid fa-clock-rotate-left' style={{ color: '#818cf8' }} />
                Riwayat Transaksi
              </div>
              {transactions.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem' }}>
                  <div style={{ color: '#94a3b8' }}>{tx.description || tx.type}</div>
                  <div style={{ fontWeight: 700, color: tx.type === 'CREDIT' ? '#10b981' : '#ef4444' }}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Analytics ───────────────────────────────────────── */
function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-chart-line' color='#fb923c' bg='rgba(251,146,60,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Analitik Toko</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Statistik performa penjualan tokomu</div>
        </div>
      </div>
      <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <i className='fa-solid fa-chart-pie' style={{ fontSize: '2.5rem', color: '#fb923c', display: 'block', marginBottom: 14 }} />
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>Analitik akan tersedia segera</div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px auto', maxWidth: 380 }}>
          Grafik dan laporan penjualan akan muncul setelah ada transaksi aktif pada tokomu.
        </p>
      </div>
    </div>
  );
}

/* ─── Verification ────────────────────────────────────── */
function Verification() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-id-badge' color='#a78bfa' bg='rgba(167,139,250,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Verifikasi Akun</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Lengkapi verifikasi untuk meningkatkan kepercayaan toko</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {[
          { icon: 'fa-solid fa-id-card', label: 'Identitas (KTP/Paspor)', status: 'Belum diverifikasi', color: '#94a3b8' },
          { icon: 'fa-solid fa-phone', label: 'Nomor Telepon', status: 'Belum diverifikasi', color: '#94a3b8' },
          { icon: 'fa-regular fa-envelope', label: 'Email', status: 'Belum diverifikasi', color: '#94a3b8' },
          { icon: 'fa-solid fa-credit-card', label: 'Rekening Bank', status: 'Belum diverifikasi', color: '#94a3b8' },
        ].map((item) => (
          <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(148,163,184,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              <i className={item.icon} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.78rem', color: item.color, marginTop: 3 }}>{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Store Settings ──────────────────────────────────── */
function StoreSettings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBox icon='fa-solid fa-gear' color='#94a3b8' bg='rgba(148,163,184,0.12)' />
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>Pengaturan Toko</h2>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Konfigurasi toko dan profil seller Anda</div>
        </div>
      </div>
      <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <i className='fa-solid fa-screwdriver-wrench' style={{ fontSize: '2.5rem', color: '#94a3b8', display: 'block', marginBottom: 14 }} />
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>Pengaturan toko akan tersedia segera</div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px auto', maxWidth: 380 }}>
          Fitur pengaturan toko lengkap sedang dalam pengembangan.
        </p>
      </div>
    </div>
  );
}

/* ─── Seller Dashboard Shell ──────────────────────────── */
export default function SellerDashboard() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '', label: 'Dashboard', icon: 'fa-solid fa-chart-pie', end: true },
    { to: 'store', label: 'Toko Saya', icon: 'fa-solid fa-store' },
    { to: 'products', label: 'Produk', icon: 'fa-solid fa-box-open' },
    { to: 'orders', label: 'Pesanan', icon: 'fa-solid fa-receipt' },
    { to: 'delivery', label: 'Pengiriman', icon: 'fa-solid fa-truck' },
    { to: 'messages', label: 'Pesan', icon: 'fa-solid fa-comments' },
    { to: 'reviews', label: 'Ulasan', icon: 'fa-solid fa-star' },
    { to: 'wallet', label: 'Dompet', icon: 'fa-solid fa-wallet' },
    { to: 'verification', label: 'Verifikasi', icon: 'fa-solid fa-id-badge' },
    { to: 'analytics', label: 'Analitik', icon: 'fa-solid fa-chart-line' },
    { to: 'settings', label: 'Pengaturan', icon: 'fa-solid fa-gear' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className='container' style={{ flex: 1, padding: '24px 16px', maxWidth: 1280, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <aside
            style={{
              width: 260,
              flexShrink: 0,
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: 18,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              position: 'sticky',
              top: 24,
            }}
          >
            {/* Seller Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.full_name || user?.username}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Seller Member
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '9px 12px',
                    borderRadius: 9,
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)' : 'transparent',
                    borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                    transition: 'all 0.18s ease',
                    textDecoration: 'none',
                  })}
                >
                  <i className={item.icon} style={{ width: 16, textAlign: 'center', fontSize: '0.9rem' }} />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '10px 0 4px' }} />

              <button
                type='button'
                onClick={() => logout()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderRadius: 9,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: '#ef4444',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <i className='fa-solid fa-right-from-bracket' style={{ width: 16, textAlign: 'center' }} />
                <span>Keluar Akun</span>
              </button>
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <Routes>
              <Route path='' element={<DashboardOverview />} />
              <Route path='store' element={<MyStore />} />
              <Route path='products' element={<Products />} />
              <Route path='orders' element={<SellerOrders />} />
              <Route path='delivery' element={<Delivery />} />
              <Route path='messages' element={<SellerMessages />} />
              <Route path='reviews' element={<Reviews />} />
              <Route path='wallet' element={<Wallet />} />
              <Route path='verification' element={<Verification />} />
              <Route path='analytics' element={<Analytics />} />
              <Route path='settings' element={<StoreSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
