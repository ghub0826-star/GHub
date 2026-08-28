import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentStatus from '../../components/checkout/PaymentStatus';
import * as orderService from '../../services/orderService';
import formatCurrency from '../../utils/formatCurrency';
import formatOrderDate from '../../utils/formatOrderDate';
import '../../styles/checkout.css';

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    orderService.getOrder(orderNumber)
      .then((res) => { if (mounted) setOrder(res.order); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.message || 'Order tidak ditemukan'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [orderNumber]);

  const handleViewInvoice = () => {
    navigate(`/invoice/${orderNumber}`);
  };

  if (loading) return <div className='container'><Header /><div className='card'>Memuat...</div></div>;
  if (error || !order) return <div className='container'><Header /><div className='card'><h2>{error || 'Order tidak ditemukan'}</h2><Link to='/buyer/orders' className='button'>Kembali</Link></div></div>;

  return (
    <div>
      <div className='container'>
        <Header />
        <nav className='breadcrumb'>
          <Link to='/'>Home</Link>
          <span> / </span>
          <Link to='/buyer/orders'>Pesanan</Link>
          <span> / </span>
          <span>Detail</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>Order {order.order_number}</h1>
            <div style={{ color: 'var(--muted)' }}>{formatOrderDate(order.created_at)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className='button secondary' onClick={handleViewInvoice}>
              <i className='fa-solid fa-file-invoice' style={{ marginRight: 6 }} />
              Lihat Invoice
            </button>
            <Link to={`/invoice/${order.order_number}`} target='_blank' className='button secondary'>
              <i className='fa-solid fa-file-arrow-down' style={{ marginRight: 6 }} />
              Unduh PDF
            </Link>
            {order.payment_status === 'PENDING' && <Link to={`/checkout/payment/${order.order_number}`} className='button'>Lanjutkan Pembayaran</Link>}
          </div>
        </div>

        <div className='checkout-layout' style={{ marginTop: 16 }}>
          <div className='checkout-main'>
            <div className='checkout-card'>
              <h3 className='checkout-card-title'>Invoice</h3>
              <div className='invoice-grid'>
                <div><span className='checkout-hint'>Logo</span><div className='seller-logo' style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>G</div></div>
                <div><span className='checkout-hint'>Nomor Order</span><strong>{order.order_number}</strong></div>
                <div><span className='checkout-hint'>Nomor Invoice</span><strong>{order.invoice_number}</strong></div>
                <div><span className='checkout-hint'>Pembeli</span><strong>{order.store_name || '-'}</strong></div>
                <div><span className='checkout-hint'>Tanggal</span><strong>{formatOrderDate(order.created_at)}</strong></div>
                <div><span className='checkout-hint'>Metode Pembayaran</span><strong>{order.payment_method}</strong></div>
                <div><span className='checkout-hint'>Status Pembayaran</span><strong>{order.payment_status}</strong></div>
              </div>
            </div>

            <div className='checkout-card'>
              <h3 className='checkout-card-title'>Produk</h3>
              {order.items?.map((item) => (
                <div key={item.id} className='checkout-product'>
                  <div className='co-product-img'>
                    <img src={item.product_image || '/assets/product-1.jpg'} alt={item.product_name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/ghub/120/80'; }} />
                  </div>
                  <div className='co-product-info'>
                    <div style={{ fontWeight: 800 }}>{item.product_name}</div>
                    <div className='checkout-hint'>{item.game || ''} • {item.seller_name || ''}</div>
                    {item.variant_label ? <div className='checkout-hint'>{item.variant_label}</div> : null}
                    {item.gameData?.length ? (
                      <div className='checkout-hint'>
                        {item.gameData.map((gd) => `${gd.label}: ${gd.value}`).join(' • ')}
                      </div>
                    ) : null}
                  </div>
                  <div className='co-product-price'>
                    <div>{formatCurrency(item.product_price)}</div>
                    <div className='checkout-hint'>× {item.quantity}</div>
                    <div style={{ fontWeight: 800 }}>{formatCurrency(item.subtotal)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className='checkout-card'>
              <h3 className='checkout-card-title'>Rincian Pembayaran</h3>
              <div className='summary-row'><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className='summary-row'><span>Diskon</span><span style={{ color: '#4ade80' }}>-{formatCurrency(order.discount)}</span></div>
              <div className='summary-row'><span>Biaya Layanan</span><span>{formatCurrency(order.service_fee)}</span></div>
              <div className='summary-row'><span>Biaya Pembayaran</span><span>{formatCurrency(order.payment_fee)}</span></div>
              <div className='summary-divider' />
              <div className='summary-row total'><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
            </div>
          </div>

          <aside className='checkout-aside'>
            <div className='checkout-card'>
              <h3 className='checkout-card-title'>Status</h3>
              <PaymentStatus paymentStatus={order.payment_status} orderStatus={order.order_status} />
              {order.subOrders?.length > 1 && (
                <div style={{ marginTop: 12 }}>
                  <div className='checkout-hint'>Sub-order ({order.subOrders.length} seller):</div>
                  {order.subOrders.map((so) => (
                    <div key={so.id} style={{ fontSize: 13, marginTop: 4 }}>
                      • {so.sub_order_number} — {so.seller_name}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Link to='/buyer/orders' className='button secondary' style={{ width: '100%' }}>Kembali ke Pesanan</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
