import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const bannerMessage = location.state?.message || null;

  const total = getCartTotal();

  return (
    <div>
      <div className='container'>
        <Header />
        <nav className='breadcrumb'>
          <Link to='/'>Home</Link>
          <span> / </span>
          <span>Keranjang</span>
        </nav>

        <h1 style={{ margin: '12px 0 4px' }}>Keranjang</h1>
        <p className='muted' style={{ color: 'var(--muted)' }}>
          {cart.length === 0 ? 'Keranjang kamu masih kosong.' : `${cart.length} item dalam keranjang`}
        </p>

        {bannerMessage && (
          <div className='co-error' style={{ marginTop: 12 }}>
            {bannerMessage}
          </div>
        )}

        {cart.length === 0 ? (
          <div className='card' style={{ marginTop: 16 }}>
            <h2>Keranjang kosong</h2>
            <p style={{ color: 'var(--muted)' }}>Yuk cari produk game favoritmu di marketplace.</p>
            <Link to='/marketplace' className='button'>Jelajahi Marketplace</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              {cart.map((item) => (
                <div key={item.slug + '-' + item.id} className='card' style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: 72, height: 56, borderRadius: 8, overflow: 'hidden' }}>
                    <img src={item.image || '/assets/product-1.jpg'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/ghub/120/80'; }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 800 }}>{item.title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{item.game || ''} • {item.sellerName || ''}</div>
                    {item.options && Object.keys(item.options).length ? (
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className='button small secondary' onClick={() => updateQuantity(item.slug, (item.quantity || 1) - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button className='button small secondary' onClick={() => updateQuantity(item.slug, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 800, minWidth: 90, textAlign: 'right' }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</div>
                  <button className='button small' style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#f87171' }} onClick={() => removeFromCart(item.slug)}>Hapus</button>
                </div>
              ))}
            </div>

            <div className='card' style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ color: 'var(--muted)' }}>Total Belanja</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>{formatCurrency(total)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className='button secondary' onClick={clearCart}>Kosongkan</button>
                <button className='button' onClick={() => navigate('/checkout')}>Lanjut ke Checkout →</button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
