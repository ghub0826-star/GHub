import React from 'react';

export default function CheckoutGameFields({ product, fields, onChange }) {
  // product.requiredFields: [{ key, label, type, required }]
  const requiredFields = Array.isArray(product.requiredFields) ? product.requiredFields : [];
  if (!requiredFields.length) return null;

  const handle = (key, value) => {
    onChange({ ...fields, [key]: value });
  };

  return (
    <div className='checkout-card' style={{ width: '100%', marginTop: 8 }}>
      <h3 className='checkout-card-title'>Data Game</h3>
      <p className='checkout-hint'>Masukkan data game kamu agar seller dapat memproses pesanan.</p>
      {requiredFields.map((rf) => (
        <div className='checkout-field' key={rf.key}>
          <label>
            {rf.label} {rf.required ? <span style={{ color: '#f87171' }}>*</span> : null}
          </label>
          <input
            type={rf.type || 'text'}
            placeholder={rf.label}
            value={fields[rf.key] || ''}
            onChange={(e) => handle(rf.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
