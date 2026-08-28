import React, { useEffect, useState } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import * as fulfillmentService from '../../services/orderFulfillmentService';
import OrderTrackingTimeline from '../../components/delivery/OrderTrackingTimeline';
import DeliveryEvidenceUploader from '../../components/delivery/DeliveryEvidenceUploader';
import formatCurrency from '../../utils/formatCurrency';

const DELIVERY_TYPES = [
  { value: 'ACCOUNT', label: 'Akun Game (Username & Password)', icon: 'fa-solid fa-user-shield' },
  { value: 'CURRENCY', label: 'Mata Uang Game (Gold/Diamond/Coin)', icon: 'fa-solid fa-coins' },
  { value: 'ITEM', label: 'Item / Skin / Senjata', icon: 'fa-solid fa-shield-halved' },
  { value: 'BOOSTING', label: 'Jasa Joki / Boosting', icon: 'fa-solid fa-gamepad' },
  { value: 'GIFT_CARD', label: 'Voucher / Redeem Code / Key', icon: 'fa-solid fa-ticket' },
  { value: 'MANUAL', label: 'Pengiriman Manual Lainnya', icon: 'fa-solid fa-box' },
];

export default function SellerOrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Delivery form state
  const [deliveryType, setDeliveryType] = useState('ACCOUNT');
  const [accountForm, setAccountForm] = useState({ username: '', password: '', email: '', notes: '' });
  const [currencyForm, setCurrencyForm] = useState({ amountSent: '', playerId: '', server: '', notes: '' });
  const [itemForm, setItemForm] = useState({ itemName: '', quantity: '1', playerId: '', server: '', notes: '' });
  const [serviceForm, setServiceForm] = useState({ serviceDetail: '', progress: '', notes: '' });
  const [voucherForm, setVoucherForm] = useState({ code: '', pin: '', instructions: '' });
  const [manualMessage, setManualMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await orderService.getOrder(orderNumber);
      setOrder(res.order);

      try {
        const timeRes = await fulfillmentService.getOrderTimeline(res.order?.id || orderNumber);
        if (timeRes.data?.success) {
          setTimeline(timeRes.data.timeline);
        }
      } catch (e) {
        // Fallback timeline structure
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat detail pesanan seller');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderNumber]);

  // Handler: Seller clicks "Kirim Pesanan Sekarang"
  const handleStartShipping = async () => {
    const subOrderId = order?.subOrder?.id || order?.id;
    if (!subOrderId) return;
    setActionLoading(true);
    try {
      await fulfillmentService.sellerStartProcessing(subOrderId);
      await loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memulai pengiriman');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Seller completes delivery with payload
  const handleCompleteDelivery = async () => {
    const subOrderId = order?.subOrder?.id || order?.id;
    if (!subOrderId) return;

    let payload = {};
    if (deliveryType === 'ACCOUNT') {
      if (!accountForm.username || !accountForm.password) {
        alert('Harap isi Username dan Password akun.');
        return;
      }
      payload = { ...accountForm };
    } else if (deliveryType === 'CURRENCY') {
      payload = { ...currencyForm };
    } else if (deliveryType === 'ITEM') {
      payload = { ...itemForm };
    } else if (deliveryType === 'BOOSTING') {
      payload = { ...serviceForm };
    } else if (deliveryType === 'GIFT_CARD') {
      if (!voucherForm.code) {
        alert('Harap isi Kode Voucher / Redeem Code.');
        return;
      }
      payload = { ...voucherForm };
    } else {
      if (!manualMessage.trim()) {
        alert('Harap masukkan pesan/detail pengiriman.');
        return;
      }
      payload = { message: manualMessage };
    }

    setActionLoading(true);
    try {
      await fulfillmentService.sellerDeliver(subOrderId, { deliveryType, payload });
      alert('Pengiriman berhasil diselesaikan! Status pesanan kini DIKIRIM (DELIVERED).');
      await loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyelesaikan pengiriman');
    } finally {
      setActionLoading(false);
    }
  };

  const openBuyerChat = () => {
    navigate(`/seller/messages?orderNumber=${order?.order_number}`);
  };

  if (loading) {
    return (
      <SellerLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#6366f1', marginBottom: 16 }}></i>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f1f5f9' }}>Memuat Pengelolaan Pengiriman...</div>
        </div>
      </SellerLayout>
    );
  }

  if (error || !order) {
    return (
      <SellerLayout>
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
            color: '#f87171',
            margin: '20px 0',
          }}
        >
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', marginBottom: 12 }}></i>
          <h3>{error || 'Pesanan tidak ditemukan'}</h3>
          <Link
            to="/seller/orders"
            style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '8px 18px',
              background: '#6366f1',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </SellerLayout>
    );
  }

  const subOrder = order.subOrder || order;
  const items = order.items || subOrder.items || [];
  const status = String(subOrder.order_status || order.order_status || 'PENDING_PAYMENT').toUpperCase();
  const isPaid = status === 'PAID';
  const isProcessing = status === 'PROCESSING';
  const isDelivered = status === 'DELIVERED';
  const isCompleted = status === 'COMPLETED';

  const canStartShipping = isPaid;
  const canDeliver = isProcessing || isPaid;

  const statusBadgeColor = {
    PAID: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa', label: 'Menunggu Pengiriman' },
    PROCESSING: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#facc15', label: 'Sedang Dikirim' },
    DELIVERED: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#c084fc', label: 'Terkirim (Menunggu Buyer)' },
    COMPLETED: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#4ade80', label: 'Selesai' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171', label: 'Dibatalkan' },
    DISPUTED: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#fb923c', label: 'Sengketa' },
  }[status] || { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8', label: status };

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background: 'linear-gradient(145deg, rgba(26,29,38,0.95), rgba(18,20,28,0.98))',
            padding: '20px 24px',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>
              <Link to="/seller/orders" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i>
                Pesanan Masuk
              </Link>
              <span>/</span>
              <span>Detail Pengiriman</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>Order #{order.order_number}</span>
              <span
                style={{
                  fontSize: '0.82rem',
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: statusBadgeColor.bg,
                  border: `1px solid ${statusBadgeColor.border}`,
                  color: statusBadgeColor.text,
                  fontWeight: 600,
                }}
              >
                {statusBadgeColor.label}
              </span>
            </h1>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Tombol Invoice */}
            <Link
              to={`/invoice/${order.order_number}`}
              target='_blank'
              rel='noopener noreferrer'
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(245,158,11,0.12)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.3)',
                padding: '10px 16px', borderRadius: 10,
                fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              <i className="fa-solid fa-file-invoice"></i>
              Invoice
            </Link>
            <button
              onClick={openBuyerChat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.35)',
                padding: '10px 18px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <i className="fa-solid fa-comments"></i>
              Chat Buyer
            </button>

            {canStartShipping && (
              <button
                onClick={handleStartShipping}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              >
                <i className="fa-solid fa-paper-plane"></i>
                {actionLoading ? 'Memproses...' : 'Kirim Pesanan Sekarang'}
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: Detail Pembelian Buyer */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(26,29,38,0.95), rgba(18,20,28,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-user-tag" style={{ color: '#38bdf8' }}></i>
            Detail Pembelian Buyer
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              background: 'rgba(15,23,42,0.6)',
              padding: 18,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Buyer</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: 2 }}>
                {order.buyer?.username || subOrder.buyer_username || 'Buyer User'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Waktu Pembelian</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#f8fafc', marginTop: 2 }}>
                {new Date(order.created_at || subOrder.created_at).toLocaleString('id-ID')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Status Pembayaran</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#4ade80', marginTop: 2 }}>
                {order.payment_status || 'PAID (Lunas)'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Metode Pembayaran</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#f8fafc', marginTop: 2 }}>
                {order.payment_method || 'Midtrans / QRIS'}
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#cbd5e1' }}>Item yang Harus Dikirim:</h4>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                  padding: 16,
                  background: 'rgba(30,41,59,0.4)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', gap: 14 }}>
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 8,
                        background: 'rgba(99,102,241,0.15)',
                        color: '#818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      <i className="fa-solid fa-gamepad"></i>
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: '#f8fafc' }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                      Game: <strong style={{ color: '#e2e8f0' }}>{item.game || 'Game Item'}</strong> | Tipe:{' '}
                      <strong style={{ color: '#e2e8f0' }}>{item.delivery_type || 'Instant'}</strong> | Jumlah:{' '}
                      <strong style={{ color: '#e2e8f0' }}>{item.quantity}x</strong>
                    </div>

                    {/* Buyer Delivery Requirements / Game Data */}
                    {item.gameDataList && item.gameDataList.length > 0 && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          background: 'rgba(99,102,241,0.08)',
                          border: '1px solid rgba(99,102,241,0.2)',
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a5b4fc', marginBottom: 4 }}>
                          <i className="fa-solid fa-id-card" style={{ marginRight: 6 }}></i>
                          Data Akun / Game ID dari Buyer:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                          {item.gameDataList.map((gd, gIdx) => (
                            <div key={gIdx} style={{ fontSize: '0.82rem' }}>
                              <span style={{ color: '#94a3b8' }}>{gd.field_label || gd.field_key}: </span>
                              <strong style={{ color: '#f8fafc' }}>{gd.field_value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Harga Satuan</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatCurrency(item.product_price || item.price)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#38bdf8', marginTop: 2 }}>
                    Subtotal: {formatCurrency(item.subtotal || (item.product_price || item.price) * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 12,
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Total Penerimaan Seller:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4ade80' }}>
              {formatCurrency(subOrder.total_amount || order.total_amount)}
            </span>
          </div>
        </div>

        {/* SECTION 2: Timeline & Durasi Pengiriman Server */}
        {timeline && <OrderTrackingTimeline timeline={timeline} currentStatus={status} />}

        {/* SECTION 3: Bukti Pengiriman (Foto & Video) */}
        <DeliveryEvidenceUploader
          orderId={order.id}
          files={order.evidenceFiles || []}
          onFilesUpdated={loadData}
        />

        {/* SECTION 4: Form Pengiriman Seller */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(26,29,38,0.95), rgba(18,20,28,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-truck-ramp-box" style={{ color: '#f59e0b' }}></i>
                Form Pengiriman Produk Digital
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Pilih jenis produk dan isi kredensial/detail pengiriman untuk dikirimkan ke Buyer secara aman.
              </p>
            </div>
          </div>

          {/* Delivery Type Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
            {DELIVERY_TYPES.map((dt) => {
              const isSelected = deliveryType === dt.value;
              return (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setDeliveryType(dt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? 'rgba(99,102,241,0.18)' : 'rgba(15,23,42,0.5)',
                    color: isSelected ? '#a5b4fc' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 600 : 500,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className={dt.icon} style={{ fontSize: '1.05rem', color: isSelected ? '#818cf8' : '#64748b' }}></i>
                  <span>{dt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Delivery Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {deliveryType === 'ACCOUNT' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Username / ID Akun *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan username / ID akun game"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Password Akun (Terenkripsi AES-256) *
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password akun game"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Email Akun (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Email bind / recovery (jika ada)"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Catatan Tambahan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Segera ubah password & kaitkan email"
                    value={accountForm.notes}
                    onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>
            )}

            {deliveryType === 'CURRENCY' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Jumlah Dikirim *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1,000 Diamond / 500k Gold"
                    value={currencyForm.amountSent}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, amountSent: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Game ID / Player ID</label>
                  <input
                    type="text"
                    placeholder="Player ID tujuan"
                    value={currencyForm.playerId}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, playerId: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Server / Region</label>
                  <input
                    type="text"
                    placeholder="Server tujuan"
                    value={currencyForm.server}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, server: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Catatan Pengiriman</label>
                  <input
                    type="text"
                    placeholder="Catatan ke buyer"
                    value={currencyForm.notes}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            {deliveryType === 'ITEM' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Nama Item *</label>
                  <input
                    type="text"
                    placeholder="Nama item / skin"
                    value={itemForm.itemName}
                    onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Jumlah</label>
                  <input
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Player ID / In-Game Name</label>
                  <input
                    type="text"
                    placeholder="Player ID tujuan"
                    value={itemForm.playerId}
                    onChange={(e) => setItemForm({ ...itemForm, playerId: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Catatan Trade / Gift</label>
                  <input
                    type="text"
                    placeholder="Contoh: Dikirim via in-game trade"
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            {deliveryType === 'GIFT_CARD' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Kode Voucher / Redeem Key *</label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={voucherForm.code}
                    onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>PIN / Serial (Jika ada)</label>
                  <input
                    type="text"
                    placeholder="PIN / Serial Number"
                    value={voucherForm.pin}
                    onChange={(e) => setVoucherForm({ ...voucherForm, pin: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Instruksi Penukaran</label>
                  <textarea
                    placeholder="Contoh: Buka website resmi game lalu masukkan kode di atas"
                    value={voucherForm.instructions}
                    onChange={(e) => setVoucherForm({ ...voucherForm, instructions: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            {(deliveryType === 'BOOSTING' || deliveryType === 'MANUAL') && (
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  Detail & Bukti Pengiriman *
                </label>
                <textarea
                  placeholder="Tuliskan konfirmasi pengerjaan, link room, atau detail pengiriman yang dilakukan..."
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>
            )}

            {/* Submit Delivery Button */}
            {canDeliver && (
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleCompleteDelivery}
                  disabled={actionLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className="fa-solid fa-circle-check"></i>
                  {actionLoading ? 'Menyelesaikan Pengiriman...' : 'Selesaikan Pengiriman & Kirim ke Buyer'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
