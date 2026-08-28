import React, { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';

const DELIVERY_TYPES = ['AUTO', 'MANUAL', 'ACCOUNT', 'TOPUP', 'ITEM', 'BOOSTING', 'GIFT_CARD'];

// Seller tool to start processing and deliver a sub-order.
export default function DeliveryActions({ subOrder, onStart, onDeliver, actionLoading }) {
  const [deliveryType, setDeliveryType] = useState('MANUAL');
  const [message, setMessage] = useState('');
  const [accountFields, setAccountFields] = useState({ username: '', password: '', email: '', notes: '' });

  const handleStart = () => {
    if (onStart) onStart(subOrder.id);
  };

  const handleDeliver = () => {
    if (!onDeliver) return;
    const payload = { message };
    if (deliveryType === 'ACCOUNT') {
      Object.assign(payload, accountFields);
    }
    onDeliver(subOrder.id, deliveryType, payload);
  };

  const status = subOrder.order_status;

  return (
    <div className='card' style={{ marginTop: 12 }}>
      <h4>Proses Pesanan</h4>
      {status === 'PAID' && (
        <button className='button' onClick={handleStart} disabled={actionLoading}>
          {actionLoading ? 'Memproses...' : 'Mulai Proses'}
        </button>
      )}

      {(status === 'PROCESSING' || status === 'PAID') && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Metode Pengiriman</label>
            <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
              {DELIVERY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {deliveryType === 'ACCOUNT' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <input placeholder='Username akun' value={accountFields.username}
                onChange={(e) => setAccountFields({ ...accountFields, username: e.target.value })} />
              <input placeholder='Password akun' type='password' value={accountFields.password}
                onChange={(e) => setAccountFields({ ...accountFields, password: e.target.value })} />
              <input placeholder='Email (opsional)' value={accountFields.email}
                onChange={(e) => setAccountFields({ ...accountFields, email: e.target.value })} />
              <textarea placeholder='Catatan pengiriman' value={accountFields.notes}
                onChange={(e) => setAccountFields({ ...accountFields, notes: e.target.value })} />
            </div>
          )}

          {deliveryType !== 'ACCOUNT' && (
            <textarea placeholder='Pesan pengiriman / detail produk' value={message}
              onChange={(e) => setMessage(e.target.value)} />
          )}

          <button className='button' onClick={handleDeliver} disabled={actionLoading}>
            {actionLoading ? 'Mengirim...' : 'Kirim Produk'}
          </button>
        </div>
      )}
    </div>
  );
}
