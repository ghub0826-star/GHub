import React from 'react';
import formatCurrency from '../../utils/formatCurrency';

export default function PaymentSummary({ order }) {
  if (!order) return null;
  return (
    <div className='checkout-card'>
      <h3 className='checkout-card-title'>Ringkasan Pembayaran</h3>
      <div className='summary-row'><span>Nomor Order</span><span>{order.order_number}</span></div>
      <div className='summary-row'><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
      <div className='summary-row'><span>Diskon</span><span style={{ color: '#4ade80' }}>-{formatCurrency(order.discount)}</span></div>
      <div className='summary-row'><span>Biaya Layanan</span><span>{formatCurrency(order.service_fee)}</span></div>
      <div className='summary-row'><span>Biaya Pembayaran</span><span>{formatCurrency(order.payment_fee)}</span></div>
      <div className='summary-divider' />
      <div className='summary-row total'><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
    </div>
  );
}
