import React from 'react';

const LABELS = {
  PENDING: { label: 'Menunggu Pembayaran', color: '#fbbf24' },
  PAYMENT_PROCESSING: { label: 'Pembayaran Diproses', color: '#60a5fa' },
  PAID: { label: 'Pembayaran Berhasil', color: '#4ade80' },
  FAILED: { label: 'Pembayaran Gagal', color: '#f87171' },
  CANCELLED: { label: 'Pembayaran Dibatalkan', color: '#9ca3af' },
  EXPIRED: { label: 'Pembayaran Kedaluwarsa', color: '#f97316' },
  REFUNDED: { label: 'Refunded', color: '#c084fc' },
  PARTIAL_REFUND: { label: 'Partial Refund', color: '#c084fc' },
};

export default function PaymentStatusCard({ paymentStatus, orderStatus }) {
  const meta = LABELS[paymentStatus] || { label: paymentStatus || '-', color: 'var(--muted)' };
  return (
    <div className='checkout-card status-card-co'>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 12, height: 12, borderRadius: 999, background: meta.color }} />
        <div>
          <div style={{ fontWeight: 800 }}>{meta.label}</div>
          {orderStatus && <div className='checkout-hint'>Order: {orderStatus}</div>}
        </div>
      </div>
    </div>
  );
}
