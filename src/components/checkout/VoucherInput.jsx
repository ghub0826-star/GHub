import React from 'react';
import formatCurrency from '../../utils/formatCurrency';

export default function VoucherInput({ value, setValue, appliedVoucher, onApply, onRemove, validation }) {
  return (
    <div className='checkout-card'>
      <h3 className='checkout-card-title'>Voucher</h3>
      {!appliedVoucher ? (
        <div className='voucher-apply'>
          <input
            placeholder='Masukkan kode voucher'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button className='button' onClick={() => onApply(value)}>Gunakan</button>
        </div>
      ) : (
        <div className='voucher-applied'>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: 'var(--accent)' }}>✓ {appliedVoucher.code}</div>
            <div className='checkout-hint'>
              Diskon {validation?.discount ? formatCurrency(validation.discount) : '—'}
            </div>
          </div>
          <button className='button secondary small' onClick={onRemove}>Hapus Voucher</button>
        </div>
      )}
      <div className='checkout-hint' style={{ marginTop: 8 }}>
        Coba kode <strong>WELCOME10</strong> atau <strong>GHUB50K</strong>
      </div>
    </div>
  );
}
