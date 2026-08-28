import React, { useEffect, useState } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import * as fulfillmentService from '../../services/orderFulfillmentService';
import OrderTrackingTimeline from '../../components/delivery/OrderTrackingTimeline';
import DeliveryEvidenceViewer from '../../components/delivery/DeliveryEvidenceViewer';
import DisputePanel from '../../components/dispute/DisputePanel';
import formatCurrency from '../../utils/formatCurrency';

export default function BuyerOrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dispute, setDispute] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const res = await orderService.getOrder(orderNumber);
      const o = res.order;
      setOrder(o);

      // Load timeline
      try {
        const timeRes = await fulfillmentService.getOrderTimeline(o.id || orderNumber);
        if (timeRes.data?.success) {
          setTimeline(timeRes.data.timeline);
        }
      } catch (_) {}

      // Load disputes
      try {
        const d = await fulfillmentService.getMyDisputes();
        const found = (d.data?.disputes || []).find((x) => x.order_number === o.order_number);
        if (found) setDispute(found);
      } catch (_) {}
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderNumber]);

  const handleConfirmReceived = async () => {
    if (!order?.id) return;
    setActionLoading(true);
    try {
      await fulfillmentService.buyerComplete(order.id);
      setShowConfirmModal(false);
      alert('Terima kasih! Pesanan telah selesai dan saldo diteruskan ke penjual.');
      await loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengonfirmasi pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDispute = async (reason, description) => {
    setActionLoading(true);
    try {
      const res = await fulfillmentService.buyerOpenDispute(order.id, { reason, description });
      setDispute(res.data.dispute);
      await loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal membuka dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!dispute) return;
    setActionLoading(true);
    try {
      await fulfillmentService.postDisputeMessage(dispute.id, message);
      const d = await fulfillmentService.getDispute(dispute.id);
      setDispute(d.data.dispute);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openSellerChat = () => {
    navigate(`/buyer/messages?orderNumber=${order?.order_number}`);
  };

  if (loading) {
    return (
      <BuyerLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#6366f1', marginBottom: 16 }}></i>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f1f5f9' }}>Memuat Pelacakan Pesanan...</div>
        </div>
      </BuyerLayout>
    );
  }

  if (error || !order) {
    return (
      <BuyerLayout>
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
            to="/buyer/orders"
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
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  const items = order.items || [];
  const deliveries = order.deliveries || [];
  const primaryDelivery = deliveries[0] || null;
  const status = String(order.order_status || 'PENDING_PAYMENT').toUpperCase();

  const isDelivered = status === 'DELIVERED';
  const isCompleted = status === 'COMPLETED';

  const statusBadgeColor = {
    PENDING_PAYMENT: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171', label: 'Menunggu Pembayaran' },
    PAID: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa', label: 'Dibayar (Menunggu Seller)' },
    PROCESSING: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#facc15', label: 'Seller Sedang Memproses' },
    DELIVERED: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#c084fc', label: 'Pesanan Dikirim (Konfirmasi Penerimaan)' },
    COMPLETED: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#4ade80', label: 'Pesanan Selesai' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171', label: 'Dibatalkan' },
    DISPUTED: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#fb923c', label: 'Dalam Sengketa' },
  }[status] || { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8', label: status };

  return (
    <BuyerLayout>
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
              <Link to="/buyer/orders" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i>
                Pesanan Saya
              </Link>
              <span>/</span>
              <span>Tracking Pesanan #{order.order_number}</span>
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
              onClick={openSellerChat}
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
              Chat Seller
            </button>

            {isDelivered && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                }}
              >
                <i className="fa-solid fa-circle-check"></i>
                Pesanan Sudah Diterima
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: Real-Time Order Tracking Timeline */}
        {timeline && <OrderTrackingTimeline timeline={timeline} currentStatus={status} />}

        {/* SECTION 2: Digital Delivery Credentials / Information (if delivered) */}
        {primaryDelivery && (
          <div
            style={{
              background: 'linear-gradient(145deg, rgba(26,29,38,0.95), rgba(18,20,28,0.98))',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 8px 32px rgba(16,185,129,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.15rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-box-check"></i>
              Informasi Pengiriman dari Seller
            </h3>

            {primaryDelivery.accountData && (
              <div
                style={{
                  background: 'rgba(15,23,42,0.8)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                {primaryDelivery.accountData.username && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Username / ID:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                        {primaryDelivery.accountData.username}
                      </span>
                      <button
                        onClick={() => copyToClipboard(primaryDelivery.accountData.username, 'user')}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: copiedKey === 'user' ? '#4ade80' : '#94a3b8',
                          padding: '3px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        {copiedKey === 'user' ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                )}

                {primaryDelivery.accountData.password && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Password Akun:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                        {primaryDelivery.accountData.password}
                      </span>
                      <button
                        onClick={() => copyToClipboard(primaryDelivery.accountData.password, 'pass')}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: copiedKey === 'pass' ? '#4ade80' : '#94a3b8',
                          padding: '3px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        {copiedKey === 'pass' ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                )}

                {primaryDelivery.accountData.email && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Email:</div>
                    <div style={{ fontWeight: 500, color: '#cbd5e1', marginTop: 4 }}>
                      {primaryDelivery.accountData.email}
                    </div>
                  </div>
                )}
              </div>
            )}

            {primaryDelivery.delivery_message && (
              <div
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.9rem',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>Pesan Seller:</div>
                {primaryDelivery.delivery_message}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Bukti Pengiriman (Foto & Video) Gallery */}
        <DeliveryEvidenceViewer files={order.evidenceFiles || []} />

        {/* SECTION 4: Product Items & Payment Breakdown */}
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
            <i className="fa-solid fa-bag-shopping" style={{ color: '#818cf8' }}></i>
            Rincian Produk & Pembayaran
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                      style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 50,
                        height: 50,
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
                    <div style={{ fontWeight: 600, fontSize: '0.98rem', color: '#f8fafc' }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                      Seller: <strong style={{ color: '#e2e8f0' }}>{item.seller_name || 'Seller'}</strong> • Jumlah:{' '}
                      <strong style={{ color: '#e2e8f0' }}>{item.quantity}x</strong>
                    </div>

                    {item.gameDataList && item.gameDataList.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                        {item.gameDataList.map((gd, gIdx) => (
                          <span
                            key={gIdx}
                            style={{
                              fontSize: '0.78rem',
                              background: 'rgba(255,255,255,0.05)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              color: '#cbd5e1',
                            }}
                          >
                            {gd.field_label || gd.field_key}: <strong>{gd.field_value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatCurrency(item.product_price || item.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxWidth: 360,
              marginLeft: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94a3b8' }}>
              <span>Subtotal Produk:</span>
              <span style={{ color: '#f8fafc' }}>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#4ade80' }}>
                <span>Diskon Voucher:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94a3b8' }}>
              <span>Biaya Layanan:</span>
              <span style={{ color: '#f8fafc' }}>{formatCurrency(order.service_fee || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#4ade80',
                paddingTop: 8,
                borderTop: '1px dashed rgba(255,255,255,0.1)',
              }}
            >
              <span>Total Pembayaran:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Dispute Panel (If needed by buyer) */}
        <DisputePanel
          order={order}
          dispute={dispute}
          onOpenDispute={handleOpenDispute}
          onSendMessage={handleSendMessage}
          actionLoading={actionLoading}
        />
      </div>

      {/* Confirmation Modal: "Pesanan Sudah Diterima" */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#1e2230',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 28,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 16px auto',
              }}
            >
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#f8fafc' }}>
              Konfirmasi Pesanan Diterima?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Pastikan Anda telah memeriksa akun / item game yang dikirimkan oleh seller dan semuanya bekerja dengan
              baik. Setelah dikonfirmasi, dana akan diteruskan ke penjual dan status menjadi <strong>SELESAI</strong>.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReceived}
                disabled={actionLoading}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                }}
              >
                {actionLoading ? 'Memproses...' : 'Ya, Pesanan Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
}
