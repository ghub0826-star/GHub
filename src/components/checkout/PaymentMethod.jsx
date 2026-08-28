import React from 'react';

const METHODS = [
  { id: 'QRIS', label: 'QRIS', desc: 'Scan dan bayar menggunakan aplikasi e-wallet atau m-banking', icon: 'fa-solid fa-qrcode' },
  { id: 'VIRTUAL_ACCOUNT', label: 'Virtual Account', desc: 'Bayar melalui transfer bank ke nomor VA', icon: 'fa-solid fa-building-columns' },
  { id: 'E_WALLET', label: 'E-Wallet', desc: 'Bayar menggunakan saldo e-wallet', icon: 'fa-solid fa-wallet' },
  { id: 'CREDIT_CARD', label: 'Kartu Kredit / Debit', desc: 'Bayar menggunakan kartu', icon: 'fa-solid fa-credit-card' },
];

export default function PaymentMethod({ value, onChange }) {
  return (
    <div className='checkout-card'>
      <h3 className='checkout-card-title'>Metode Pembayaran</h3>
      <div className='payment-methods'>
        {METHODS.map((m) => (
          <label key={m.id} className={`payment-method ${value === m.id ? 'active' : ''}`}>
            <input
              type='radio'
              name='payment-method'
              value={m.id}
              checked={value === m.id}
              onChange={() => onChange(m.id)}
            />
            <div className='pm-icon'><i className={m.icon} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{m.label}</div>
              <div className='checkout-hint'>{m.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <p className='checkout-hint' style={{ marginTop: 10 }}>
        Pembayaran akan diproses melalui payment gateway. Data kartu tidak disimpan oleh GHub.
      </p>
    </div>
  );
}
