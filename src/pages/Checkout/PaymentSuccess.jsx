import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import * as orderService from '../../services/orderService';
import formatCurrency from '../../utils/formatCurrency';
import '../../styles/checkout.css';

export default function PaymentSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notPaid, setNotPaid] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Status must be verified from backend, not just URL.
    orderService.getPaymentStatus(orderNumber)
      .then((res) => {
        if (!mounted) return;
        if (res.paymentStatus === 'PAID' || res.orderStatus === 'PAID') {
          setOrder(res);
        } else {
          setNotPaid(true);
        }
      })
      .catch(() => { if (mounted) setNotPaid(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [orderNumber]);

  if (loading) return <div className='container'><Header /><div className='card'>Memverifikasi pembayaran...</div></div>;

  if (notPaid || !order) {
    return (
      <div className='container'>
        <Header />
        <div className='card' style={{ textAlign: 'center', marginTop: 24 }}>
          <h2>Pembayaran Belum Berhasil</h2>
          <p style={{ color: 'var(--muted)' }}>Status pembayaranmu belum PAID. Silakan cek kembali.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <Link to={`/checkout/payment/${orderNumber}`} className='button'>Coba Bayar Lagi</Link>
            <Link to={`/order/${orderNumber}`} className='button secondary'>Lihat Pesanan</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='container'>
        <Header />
        <div className='card' style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
          <h2>Pembayaran Berhasil</h2>
          <p style={{ color: 'var(--muted)' }}>Pesanan kamu sedang diteruskan kepada seller.</p>

          <div className='co-success-info'>
            <div><span>Nomor Order</span><strong>{order.orderNumber}</strong></div>
            <div><span>Total</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
            <div><span>Status</span><strong>PAID</strong></div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <Link to={`/order/${order.orderNumber}`} className='button'>Lihat Pesanan</Link>
            <Link to='/' className='button secondary'>Kembali ke Homepage</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
