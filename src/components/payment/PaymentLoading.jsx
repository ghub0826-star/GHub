import React from 'react';

export default function PaymentLoading({ message = 'Memproses pembayaran...' }) {
  return (
    <div className='checkout-card' style={{ textAlign: 'center', padding: '2rem' }}>
      <div className='co-loading-spinner' style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 1rem', animation: 'co-spin 1s linear infinite' }} />
      <p className='checkout-hint' style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
