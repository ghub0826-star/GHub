import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentStatusCard from '../../components/payment/PaymentStatusCard';
import PaymentSummary from '../../components/payment/PaymentSummary';
import PaymentLoading from '../../components/payment/PaymentLoading';
import * as orderService from '../../services/orderService';
import * as paymentService from '../../services/paymentService';
import * as midtransService from '../../services/midtransService';
import usePaymentStatus from '../../hooks/usePaymentStatus';
import formatCurrency from '../../utils/formatCurrency';
import formatOrderDate from '../../utils/formatOrderDate';
import '../../styles/checkout.css';

export default function Payment() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [snapOpen, setSnapOpen] = useState(false);
  const [clientKeyReady, setClientKeyReady] = useState(true);
  const [pollEnabled, setPollEnabled] = useState(false);

  // Fetch order data
  useEffect(() => {
    let mounted = true;
    orderService.getOrder(orderNumber)
      .then((res) => { if (mounted) setOrder(res.order); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.message || 'Order tidak ditemukan'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [orderNumber]);

  // Poll payment status when Snap is open or already paid
  const { status: pollStatus } = usePaymentStatus(orderNumber, {
    enabled: pollEnabled && !!orderNumber,
    intervalMs: 5000,
    maxAttempts: 12,
  });

  // Navigate on terminal status from polling
  useEffect(() => {
    if (!pollStatus) return;
    const s = pollStatus.paymentStatus;
    if (s === 'PAID') {
      navigate(`/checkout/success/${orderNumber}`, { replace: true });
    } else if (s === 'FAILED' || s === 'EXPIRED' || s === 'CANCELLED') {
      // Keep on payment page, show error message
      setPayError(`Pembayaran ${s.toLowerCase()}`);
      setPaying(false);
      setSnapOpen(false);
    }
  }, [pollStatus, orderNumber, navigate]);

  // Start payment: get Snap token from backend, then open Snap modal
  const handleStartPayment = useCallback(async () => {
    if (paying || !orderNumber) return;
    setPaying(true);
    setPayError(null);

    try {
      const res = await paymentService.createMidtransPayment(orderNumber);
      if (!res.success || !res.payment?.snapToken) {
        throw new Error(res.message || 'Gagal mendapatkan token pembayaran');
      }

      const { snapToken } = res.payment;
      setSnapOpen(true);
      setPollEnabled(true);

      // Open the Snap modal
      await midtransService.openSnap(snapToken, {
        onSuccess: (result) => {
          // Modal closed on success — backend webhook will update status.
          // Navigate to success page after a brief delay to let webhook process.
          setTimeout(() => {
            navigate(`/checkout/success/${orderNumber}`, { replace: true });
          }, 2000);
        },
        onPending: () => {
          // Payment pending — keep polling
          setSnapOpen(false);
        },
        onError: (result) => {
          setPayError(result?.status_message || 'Pembayaran gagal');
          setPaying(false);
          setSnapOpen(false);
          setPollEnabled(false);
        },
        onClose: () => {
          // User closed the modal — keep polling in case payment was made
          setSnapOpen(false);
          // If already paid, it'll navigate; otherwise stay on page
          setTimeout(() => { if (pollEnabled) setPaying(false); }, 1000);
        },
      });
    } catch (e) {
      setPayError(e?.response?.data?.message || e.message || 'Gagal memproses pembayaran');
      setPaying(false);
      setSnapOpen(false);
      setPollEnabled(false);
    }
  }, [orderNumber, paying, navigate, pollEnabled]);

  // Retry payment (for failed/expired payments)
  const handleRetry = useCallback(async () => {
    if (paying || !orderNumber) return;
    setPaying(true);
    setPayError(null);

    try {
      const res = await paymentService.retryPayment(orderNumber);
      if (!res.success || !res.payment?.snapToken) {
        throw new Error(res.message || 'Gagal mendapatkan token pembayaran ulang');
      }

      setSnapOpen(true);
      setPollEnabled(true);

      await midtransService.openSnap(res.payment.snapToken, {
        onSuccess: () => {
          setTimeout(() => navigate(`/checkout/success/${orderNumber}`, { replace: true }), 2000);
        },
        onPending: () => { setSnapOpen(false); },
        onError: (result) => {
          setPayError(result?.status_message || 'Pembayaran gagal');
          setPaying(false);
          setSnapOpen(false);
          setPollEnabled(false);
        },
        onClose: () => {
          setSnapOpen(false);
          setTimeout(() => { if (pollEnabled) setPaying(false); }, 1000);
        },
      });
    } catch (e) {
      setPayError(e?.response?.data?.message || e.message || 'Gagal memproses pembayaran ulang');
      setPaying(false);
      setSnapOpen(false);
      setPollEnabled(false);
    }
  }, [orderNumber, paying, navigate, pollEnabled]);

  if (loading) return <div className='container'><Header /><PaymentLoading message='Memuat halaman pembayaran...' /></div>;
  if (error || !order) return (
    <div className='container'>
      <Header />
      <div className='card'>
        <h2>{error || 'Order tidak ditemukan'}</h2>
        <Link to='/buyer/orders' className='button'>Kembali ke Pesanan</Link>
      </div>
    </div>
  );

  const isTerminal = ['PAID', 'REFUNDED'].includes(order.payment_status);
  const isPending = order.payment_status === 'PENDING' || order.payment_status === 'PENDING_PAYMENT';
  const isFailed = ['FAILED', 'EXPIRED', 'CANCELLED'].includes(order.payment_status);

  return (
    <div>
      <div className='container'>
        <Header />
        <nav className='breadcrumb'>
          <Link to='/'>Home</Link>
          <span> / </span>
          <Link to='/buyer/orders'>Pesanan</Link>
          <span> / </span>
          <span>Pembayaran</span>
        </nav>

        <h1 style={{ margin: '12px 0 4px' }}>Selesaikan Pembayaran</h1>
        <p style={{ color: 'var(--muted)' }}>Lengkapi pembayaran untuk melanjutkan pesananmu.</p>

        {(payError || order.payment_status === 'FAILED' || order.payment_status === 'EXPIRED') && (
          <div className='co-error'>{payError || `Pembayaran ${order.payment_status.toLowerCase()}. Silakan coba lagi.`}</div>
        )}

        <div className='checkout-layout'>
          <div className='checkout-main'>
            <PaymentStatusCard paymentStatus={order.payment_status} orderStatus={order.order_status} />

            <div className='checkout-card'>
              <h3 className='checkout-card-title'>Detail Pembayaran</h3>
              <div className='summary-row'><span>Nomor Order</span><span>{order.order_number}</span></div>
              <div className='summary-row'><span>Total</span><span style={{ fontWeight: 800 }}>{formatCurrency(order.total_amount)}</span></div>
              <div className='summary-row'><span>Metode Pembayaran</span><span>{order.payment_method}</span></div>
              <div className='summary-row'><span>Batas Waktu</span><span>{formatOrderDate(order.payment_due_at)}</span></div>
            </div>

            {!isTerminal && (
              <div className='checkout-card'>
                <p className='checkout-hint'>
                  Pembayaran akan diproses melalui Midtrans. Klik tombol untuk membuka halaman pembayaran aman.
                </p>
                <button
                  className='checkout-submit'
                  onClick={isFailed ? handleRetry : handleStartPayment}
                  disabled={paying || snapOpen || !clientKeyReady}
                >
                  {paying ? 'Memproses...' : isFailed ? 'Coba Bayar Lagi' : 'Lanjutkan ke Pembayaran'}
                </button>
              </div>
            )}

            {isTerminal && (
              <div className='checkout-card'>
                <p className='checkout-hint' style={{ color: '#4ade80' }}>Pembayaran telah selesai.</p>
                <Link to={`/checkout/success/${order.order_number}`} className='checkout-submit' style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  Lihat Status Pesanan
                </Link>
              </div>
            )}
          </div>

          <aside className='checkout-aside'>
            <PaymentSummary order={order} />
            <div className='checkout-card'>
              <Link to={`/order/${order.order_number}`} className='button secondary' style={{ width: '100%' }}>Lihat Pesanan</Link>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
