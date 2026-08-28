import React from 'react';

const LABELS = {
  PENDING: { label: 'Menunggu Pembayaran', color: '#fbbf24' },
  PAYMENT_PROCESSING: { label: 'Pembayaran Diproses', color: '#60a5fa' },
  PAID: { label: 'Pembayaran Berhasil', color: '#4ade80' },
  PAYMENT_PROCESSED: { label: 'Pembayaran Diproses', color: '#60a5fa' },
  FAILED: { label: 'Pembayaran Gagal', color: '#f87171' },
  EXPIRED: { label: 'Pembayaran Kedaluwarsa', color: '#f97316' },
  REFUNDED: { label: 'Refunded', color: '#c084fc' },
};

// orderStatus: PENDING_PAYMENT, PAYMENT_PROCESSING, PAID, PROCESSING, DELIVERED, COMPLETED, CANCELLED, EXPIRED, DISPUTED
const ORDER_LABELS = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAYMENT_PROCESSING: 'Pembayaran Diproses',
  PAID: 'Dibayar',
  PROCESSING: 'Diproses Seller',
  DELIVERED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
  DISPUTED: 'Dispute',
};

export default function PaymentStatus({ paymentStatus, orderStatus }) {
  const p = LABELS[paymentStatus] || { label: paymentStatus, color: 'var(--muted)' };
  const o = ORDER_LABELS[orderStatus] || orderStatus;

  return (
    <div className='checkout-card status-card-co'>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 12, height: 12, borderRadius: 999, background: p.color }} />
        <div>
          <div style={{ fontWeight: 800 }}>{p.label}</div>
          {orderStatus && <div className='checkout-hint'>Order: {o}</div>}
        </div>
      </div>
    </div>
  );
}
