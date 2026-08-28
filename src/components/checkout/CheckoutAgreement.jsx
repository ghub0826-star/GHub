import React from 'react';

export default function CheckoutAgreement({ agree, setAgree, submitting, onSubmit }) {
  return (
    <div className='checkout-card'>
      <label className='agree-row'>
        <input
          type='checkbox'
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>Saya menyetujui Syarat dan Ketentuan serta Kebijakan Pembayaran GHub.</span>
      </label>
      <button
        className='button checkout-submit'
        disabled={submitting || !agree}
        onClick={onSubmit}
      >
        {submitting ? 'Membuat Pesanan...' : 'Buat Pesanan dan Lanjutkan Pembayaran'}
      </button>
      {!agree && <div className='checkout-hint' style={{ marginTop: 6 }}>Centang persetujuan untuk melanjutkan.</div>}
    </div>
  );
}
