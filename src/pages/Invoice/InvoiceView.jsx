/**
 * InvoiceView.jsx
 * Halaman invoice yang dapat dilihat di browser dan diunduh sebagai PDF
 * via window.print() dengan CSS @media print.
 *
 * Route: /invoice/:orderNumber
 * Akses: buyer atau seller yang terlibat dalam order tersebut.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import './InvoiceView.css';

/* ── Helpers ── */
const fmtIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n || 0));

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const fmtDateShort = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

function StatusChip({ status }) {
  const map = {
    PAID:    { label: 'LUNAS',     color: '#10b981', bg: '#d1fae5' },
    PENDING: { label: 'MENUNGGU',  color: '#d97706', bg: '#fef3c7' },
    FAILED:  { label: 'GAGAL',     color: '#dc2626', bg: '#fee2e2' },
    REFUNDED:{ label: 'DIREFUND',  color: '#7c3aed', bg: '#ede9fe' },
    EXPIRED: { label: 'KADALUARSA',color: '#6b7280', bg: '#f3f4f6' },
  };
  const s = String(status || 'PENDING').toUpperCase();
  const { label, color, bg } = map[s] || map.PENDING;
  return (
    <span className='inv-status-chip' style={{ color, background: bg, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

export default function InvoiceView() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    orderService.getInvoice(orderNumber)
      .then(res => {
        if (res.invoice) setInvoice(res.invoice);
        else setError('Invoice tidak ditemukan untuk pesanan ini.');
      })
      .catch(e => setError(e?.response?.data?.message || 'Gagal memuat invoice.'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  /* ── Print / Download PDF ── */
  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className='inv-loading-wrap'>
        <div className='inv-spinner' />
        <p>Memuat invoice...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !invoice) {
    return (
      <div className='inv-error-wrap'>
        <div className='inv-error-icon'>⚠</div>
        <h2>{error || 'Invoice tidak tersedia'}</h2>
        <p>Pastikan Anda memiliki akses ke pesanan ini.</p>
        <button className='inv-back-btn' onClick={() => navigate(-1)}>← Kembali</button>
      </div>
    );
  }

  const isPaid    = String(invoice.payment_status || '').toUpperCase() === 'PAID';
  const sellerTotalAmounts = {};
  invoice.items.forEach(it => {
    const sn = it.seller_name || 'Seller';
    sellerTotalAmounts[sn] = (sellerTotalAmounts[sn] || 0) + it.subtotal;
  });

  return (
    <div className='inv-page-root'>

      {/* ── Toolbar (tidak ikut print) ── */}
      <div className='inv-toolbar no-print'>
        <div className='inv-toolbar-left'>
          <button className='inv-toolbar-back' onClick={() => navigate(-1)} aria-label='Kembali'>
            <i className='fa-solid fa-arrow-left' /> Kembali
          </button>
          <span className='inv-toolbar-title'>Invoice #{invoice.invoice_number}</span>
        </div>
        <div className='inv-toolbar-right'>
          <button
            className='inv-btn inv-btn--outline'
            onClick={handlePrint}
            disabled={printing}
          >
            <i className='fa-solid fa-print' />
            {printing ? 'Membuka...' : 'Cetak'}
          </button>
          <button
            className='inv-btn inv-btn--primary'
            onClick={handlePrint}
            disabled={printing}
          >
            <i className='fa-solid fa-file-arrow-down' />
            Unduh PDF
          </button>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div className='inv-doc-wrapper'>
        <div className='inv-doc' ref={invoiceRef} id='invoice-print-area'>

          {/* Header */}
          <div className='inv-header'>
            <div className='inv-brand'>
              <div className='inv-brand-logo'>G</div>
              <div>
                <div className='inv-brand-name'>GHub Marketplace</div>
                <div className='inv-brand-tagline'>Digital Gaming Marketplace</div>
              </div>
            </div>
            <div className='inv-header-right'>
              <div className='inv-doc-title'>INVOICE</div>
              <StatusChip status={invoice.payment_status} />
            </div>
          </div>

          {/* Invoice meta */}
          <div className='inv-meta-row'>
            <div className='inv-meta-block'>
              <div className='inv-meta-label'>Nomor Invoice</div>
              <div className='inv-meta-value inv-meta-value--big'>{invoice.invoice_number}</div>
            </div>
            <div className='inv-meta-block'>
              <div className='inv-meta-label'>Nomor Pesanan</div>
              <div className='inv-meta-value'>{invoice.order_number}</div>
            </div>
            <div className='inv-meta-block'>
              <div className='inv-meta-label'>Tanggal Diterbitkan</div>
              <div className='inv-meta-value'>{fmtDateShort(invoice.issued_at)}</div>
            </div>
            {invoice.paid_at && (
              <div className='inv-meta-block'>
                <div className='inv-meta-label'>Tanggal Pembayaran</div>
                <div className='inv-meta-value'>{fmtDateShort(invoice.paid_at)}</div>
              </div>
            )}
            <div className='inv-meta-block'>
              <div className='inv-meta-label'>Metode Pembayaran</div>
              <div className='inv-meta-value'>{invoice.payment_method || '—'}</div>
            </div>
          </div>

          <div className='inv-divider' />

          {/* Bill to / Seller */}
          <div className='inv-parties'>
            <div className='inv-party'>
              <div className='inv-party-label'>TAGIHAN KEPADA</div>
              <div className='inv-party-name'>{invoice.buyer?.name || invoice.buyer?.username || '—'}</div>
              {invoice.buyer?.email && <div className='inv-party-detail'>{invoice.buyer.email}</div>}
              {invoice.buyer?.phone && <div className='inv-party-detail'>{invoice.buyer.phone}</div>}
              <div className='inv-party-detail'>@{invoice.buyer?.username}</div>
            </div>
            {invoice.seller && (
              <div className='inv-party inv-party--seller'>
                <div className='inv-party-label'>DARI SELLER</div>
                <div className='inv-party-name'>{invoice.seller.name}</div>
                {invoice.seller.email && <div className='inv-party-detail'>{invoice.seller.email}</div>}
                <div className='inv-party-detail'>@{invoice.seller.username}</div>
              </div>
            )}
          </div>

          <div className='inv-divider' />

          {/* Items table */}
          <div className='inv-items-section'>
            <div className='inv-section-title'>Rincian Produk</div>
            <table className='inv-table'>
              <thead>
                <tr>
                  <th className='inv-th inv-th--desc'>Produk</th>
                  <th className='inv-th inv-th--num'>Qty</th>
                  <th className='inv-th inv-th--num'>Harga Satuan</th>
                  <th className='inv-th inv-th--num'>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className='inv-tr'>
                    <td className='inv-td'>
                      <div className='inv-item-name'>{item.product_name}</div>
                      {item.game && <div className='inv-item-meta'>{item.game}</div>}
                      {item.seller_name && <div className='inv-item-meta'>Seller: {item.seller_name}</div>}
                      {item.variant_label && <div className='inv-item-meta'>Varian: {item.variant_label}</div>}
                      {item.delivery_type && <div className='inv-item-meta'>Pengiriman: {item.delivery_type}</div>}
                      {item.gameDataList?.length > 0 && (
                        <div className='inv-item-gamedata'>
                          {item.gameDataList.map(gd => (
                            <span key={gd.field_key} className='inv-gd-chip'>
                              {gd.field_label}: {gd.field_value}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className='inv-td inv-td--num'>{item.quantity}</td>
                    <td className='inv-td inv-td--num'>{fmtIDR(item.unit_price)}</td>
                    <td className='inv-td inv-td--num inv-td--bold'>{fmtIDR(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className='inv-summary-wrap'>
            <div className='inv-summary'>
              <div className='inv-sum-row'>
                <span>Subtotal</span>
                <span>{fmtIDR(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className='inv-sum-row inv-sum-row--discount'>
                  <span>
                    Diskon
                    {invoice.voucher_code && (
                      <span className='inv-voucher-chip'>{invoice.voucher_code}</span>
                    )}
                  </span>
                  <span>-{fmtIDR(invoice.discount)}</span>
                </div>
              )}
              {invoice.service_fee > 0 && (
                <div className='inv-sum-row'>
                  <span>Biaya Layanan</span>
                  <span>{fmtIDR(invoice.service_fee)}</span>
                </div>
              )}
              {invoice.payment_fee > 0 && (
                <div className='inv-sum-row'>
                  <span>Biaya Pembayaran</span>
                  <span>{fmtIDR(invoice.payment_fee)}</span>
                </div>
              )}
              <div className='inv-sum-divider' />
              <div className='inv-sum-row inv-sum-row--total'>
                <span>TOTAL</span>
                <span>{fmtIDR(invoice.total_amount)}</span>
              </div>
              <div className='inv-sum-row inv-sum-row--currency'>
                <span>Mata Uang</span>
                <span>{invoice.currency || 'IDR'}</span>
              </div>
            </div>
          </div>

          {/* Status bar */}
          {isPaid && (
            <div className='inv-paid-stamp'>
              <i className='fa-solid fa-circle-check' /> LUNAS — {fmtDate(invoice.paid_at || invoice.issued_at)}
            </div>
          )}

          <div className='inv-divider' />

          {/* Footer */}
          <div className='inv-footer'>
            <div className='inv-footer-note'>
              Dokumen ini diterbitkan secara otomatis oleh sistem <strong>GHub Marketplace</strong>
              dan berlaku tanpa tanda tangan. Simpan sebagai bukti transaksi Anda.
            </div>
            <div className='inv-footer-meta'>
              <span>GHub Marketplace · ghub.id</span>
              <span>Dicetak: {fmtDate(new Date())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
