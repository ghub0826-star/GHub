import React from 'react';
import formatCurrency from '../../utils/formatCurrency';

export default function OrderSummary({ validation, validating }) {
  return (
    <div className='checkout-card summary'>
      <h3 className='checkout-card-title'>Ringkasan Pesanan</h3>
      {validating ? (
        <div className='checkout-hint'>Menghitung...</div>
      ) : validation ? (
        <>
          <div className='summary-row'>
            <span>Subtotal</span>
            <span>{formatCurrency(validation.subtotal)}</span>
          </div>
          <div className='summary-row'>
            <span>Diskon Voucher</span>
            <span style={{ color: '#4ade80' }}>-{formatCurrency(validation.discount)}</span>
          </div>
          <div className='summary-row'>
            <span>Biaya Layanan</span>
            <span>{formatCurrency(validation.serviceFee)}</span>
          </div>
          <div className='summary-row'>
            <span>Biaya Pembayaran</span>
            <span>{formatCurrency(validation.paymentFee)}</span>
          </div>
          <div className='summary-divider' />
          <div className='summary-row total'>
            <span>Total Pembayaran</span>
            <span>{formatCurrency(validation.totalAmount)}</span>
          </div>
        </>
      ) : (
        <div className='checkout-hint'>Total akan muncul setelah validasi.</div>
      )}
    </div>
  );
}
