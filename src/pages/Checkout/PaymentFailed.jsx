import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import * as orderService from '../../services/orderService';
import '../../styles/checkout.css';

export default function PaymentFailed() {
  const { orderNumber } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    orderService.getPaymentStatus(orderNumber)
      .then((res) => { if (mounted) setStatus(res); })
      .catch(() => { if (mounted) setStatus({ paymentStatus: 'FAILED' }); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [orderNumber]);

  return (
    <div>
      <div className='container'>
        <Header />
        <div className='card' style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>⚠️</div>
          <h2>Pembayaran Belum Berhasil</h2>
          <p style={{ color: 'var(--muted)' }}>Pembayaran untuk pesanan ini belum berhasil diproses.</p>

          {loading ? (
            <p className='checkout-hint'>Memuat status...</p>
          ) : (
            <div className='co-success-info'>
              <div><span>Nomor Order</span><strong>{orderNumber}</strong></div>
              <div><span>Status Pembayaran</span><strong>{status?.paymentStatus || 'FAILED'}</strong></div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <Link to={`/checkout/payment/${orderNumber}`} className='button'>Coba Bayar Lagi</Link>
            <Link to={`/order/${orderNumber}`} className='button secondary'>Lihat Pesanan</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
