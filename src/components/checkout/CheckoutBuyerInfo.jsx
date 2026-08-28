import React from 'react';

export default function CheckoutBuyerInfo({ user, whatsapp, setWhatsapp }) {
  return (
    <div className='checkout-card'>
      <h3 className='checkout-card-title'>Data Pembeli</h3>
      <div className='checkout-field'>
        <label>Nama Lengkap</label>
        <input value={user?.full_name || user?.name || user?.username || ''} readOnly />
      </div>
      <div className='checkout-field'>
        <label>Email</label>
        <input value={user?.email || ''} readOnly />
      </div>
      <div className='checkout-field'>
        <label>Nomor WhatsApp</label>
        {whatsapp ? (
          <input value={whatsapp} readOnly />
        ) : (
          <input
            type='tel'
            placeholder='Contoh: 081234567890'
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        )}
        <small className='checkout-hint'>Nomor WhatsApp digunakan untuk pengiriman produk digital / komunikasi seller.</small>
      </div>
    </div>
  );
}
