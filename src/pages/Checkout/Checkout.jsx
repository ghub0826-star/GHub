import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCheckout } from '../../hooks/useCheckout';
import { useCart } from '../../context/CartContext';
import CheckoutBuyerInfo from '../../components/checkout/CheckoutBuyerInfo';
import CheckoutItems from '../../components/checkout/CheckoutItems';
import VoucherInput from '../../components/checkout/VoucherInput';
import PaymentMethod from '../../components/checkout/PaymentMethod';
import OrderSummary from '../../components/checkout/OrderSummary';
import CheckoutAgreement from '../../components/checkout/CheckoutAgreement';
import '../../styles/checkout.css';

export default function CheckoutPage() {
  const {
    user,
    sellerGroups,
    validation,
    validating,
    validationError,
    validationItemsMap,
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    paymentMethod,
    setPaymentMethod,
    agree,
    setAgree,
    submitting,
    submitOrder,
    gameData,
    setGameData,
    navigate,
  } = useCheckout();

  const { cart, removeFromCart } = useCart();
  const [whatsapp, setWhatsapp] = useState(user?.phone || '');

  // Empty-cart guard: redirect to /cart with a message
  useEffect(() => {
    if (!cart.length) {
      navigate('/cart', { replace: true, state: { message: 'Keranjang kamu masih kosong.' } });
    }
  }, [cart.length, navigate]);

  const setGameDataForItem = (productId, fields) => {
    setGameData((prev) => ({ ...prev, [productId]: fields }));
  };

  const handleSubmit = async () => {
    if (!agree || submitting || !validation) return;
    // Client-side required game data validation using backend-validated requiredFields
    for (const item of cart) {
      const meta = validationItemsMap?.get?.(String(item.id)) || {};
      const rf = meta.requiredFields?.length ? meta.requiredFields : (item.requiredFields || []);
      const fields = gameData[item.id] || {};
      for (const f of rf) {
        if (f.required && (!fields[f.key] || String(fields[f.key]).trim() === '')) {
          alert(`Data game wajib diisi: ${f.label}`);
          return;
        }
      }
    }
    const res = await submitOrder();
    if (res && res.success) {
      // Remove only successfully ordered items from cart (order already persisted)
      cart.forEach((item) => removeFromCart(item.slug));
      navigate(res.redirectUrl || `/checkout/payment/${res.orderNumber}`);
    } else {
      alert(res?.message || 'Gagal membuat pesanan');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <div className='container'>
        <Header />

        <nav className='breadcrumb'>
          <Link to='/'>Home</Link>
          <span> / </span>
          <Link to='/cart'>Keranjang</Link>
          <span> / </span>
          <span>Checkout</span>
        </nav>

        <h1 style={{ margin: '12px 0 4px' }}>Checkout</h1>
        <p style={{ color: 'var(--muted)' }}>Periksa pesanan dan lengkapi data sebelum melakukan pembayaran.</p>

        {validationError && (
          <div className='co-error'>
            <strong>Perhatian:</strong> {validationError}
            <Link to='/cart' style={{ marginLeft: 8, color: 'var(--accent)' }}>Kembali ke Keranjang</Link>
          </div>
        )}

        <div className='checkout-layout'>
          <div className='checkout-main'>
            <CheckoutBuyerInfo user={user} whatsapp={whatsapp} setWhatsapp={setWhatsapp} />
            <CheckoutItems sellerGroups={sellerGroups} gameData={gameData} setGameDataForItem={setGameDataForItem} validationItemsMap={validationItemsMap} />
            <VoucherInput
              value={voucherCode}
              setValue={setVoucherCode}
              appliedVoucher={appliedVoucher}
              onApply={applyVoucher}
              onRemove={removeVoucher}
              validation={validation}
            />
            <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <aside className='checkout-aside'>
            <div style={{ position: 'sticky', top: 88, display: 'grid', gap: 12 }}>
              <OrderSummary validation={validation} validating={validating} />
              <CheckoutAgreement agree={agree} setAgree={setAgree} submitting={submitting} onSubmit={handleSubmit} />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
