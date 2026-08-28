import React from 'react';

// Buyer confirmation button shown when order is DELIVERED.
export default function BuyerConfirmReceived({ order, onComplete, actionLoading }) {
  if (order.order_status !== 'DELIVERED') return null;
  return (
    <div className='card' style={{ marginTop: 12 }}>
      <h4>Produk Sudah Diterima?</h4>
      <p className='muted'>Klik tombol berikut untuk menyelesaikan pesanan. Dana baru akan diteruskan ke seller setelah pesanan selesai.</p>
      <button className='button' onClick={() => onComplete(order.id)} disabled={actionLoading}>
        {actionLoading ? 'Memproses...' : 'Ya, Pesanan Selesai'}
      </button>
    </div>
  );
}
