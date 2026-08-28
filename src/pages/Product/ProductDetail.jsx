import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useProduct from '../../hooks/useProduct';
import formatCurrency from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import staticProducts from '../../data/products';
import '../../pages/Marketplace/Marketplace.css';
import './ProductDetail.css';

import ProductGallery from '../../components/product/ProductGallery';
import ProductOptions from '../../components/product/ProductOptions';
import ProductQuantity from '../../components/product/ProductQuantity';
import SellerInfo from '../../components/product/SellerInfo';
import ProductTabs from '../../components/product/ProductTabs';
import RelatedProducts from '../../components/product/RelatedProducts';
import SEO from '../../components/seo/SEO';
import { APP_URL } from '../../config/seoConfig';

export default function ProductDetail(){
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);

  useEffect(()=>{ window.scrollTo(0,0); setQuantity(1); setSelectedOptions({}); }, [slug]);

  if (!loading && !product){
    return (
      <div className='container'>
        <div className='card'>
          <h2>Produk Tidak Ditemukan</h2>
          <p>Maaf, produk yang Anda cari tidak tersedia.</p>
          <Link to='/marketplace' className='button'>Kembali ke Marketplace</Link>
        </div>
      </div>
    );
  }

  const onAddToCart = () =>{
    // validate
    if (!product) return;
    addToCart(product, quantity, selectedOptions);
    // show simple toast via alert fallback
    try{ window.__toast && window.__toast('Berhasil ditambahkan ke keranjang'); }catch{}
  };

  const onBuyNow = () =>{
    addToCart(product, quantity, selectedOptions);
    const payload = { ...product, quantity, options: selectedOptions };
    navigate('/checkout', { state: { product: payload } });
  };

const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image ? `${APP_URL}${product.image}` : undefined,
    description: product.description || product.title,
    brand: { '@type': 'Brand', name: product.sellerName || 'GHub' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: product.sellerName || 'GHub' },
    },
  } : null;

  const breadcrumbSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${APP_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${APP_URL}/marketplace` },
      { '@type': 'ListItem', position: 3, name: product.title, item: `${APP_URL}/product/${slug}` },
    ],
  } : null;

  return (
    <div className='product-page container'>
      <SEO
        title={product ? `${product.title} - GHub` : 'Produk - GHub'}
        description={product ? (product.description || `Beli ${product.title} aman di GHub.`) : 'Detail produk di GHub.'}
        keywords={`${product ? product.title + ', ' : ''}top up, item game, akun game, GHub`}
        canonical={`/product/${slug}`}
        type="product"
        image={product && product.image ? `${APP_URL}${product.image}` : undefined}
        jsonLd={[productSchema, breadcrumbSchema].filter(Boolean)}
      />
      <nav className='breadcrumb'>
        <Link to='/'>Home</Link>
        <span> / </span>
        <Link to='/marketplace'>Marketplace</Link>
        <span> / </span>
        {product && <Link to={`/game/${product.gameSlug}`}>{product.game}</Link>}
        <span> / </span>
        <span>{product ? product.title : 'Loading...'}</span>
      </nav>

      {loading ? <div className='card'>Loading...</div> : (
        <div className='product-detail-grid'>
          <div className='col gallery'>
            <ProductGallery images={[product.image].concat(product.images||[])} />
            <SellerInfo seller={{ name: product.sellerName, slug: product.sellerSlug, verified: product.sellerVerified }} />
          </div>

          <div className='col info'>
            <div className='card'>
              <div className='badge'>{product.category}</div>
              <h1>{product.title}</h1>
              <div className='meta'>
                <div className='rating'>⭐ {product.rating} · {product.reviewCount} ulasan · {product.totalSales} terjual</div>
                <div className='price'>{formatCurrency(product.price)}</div>
                {product.deliveryType === 'instant' && <div className='instant'>⚡ Pengiriman Instan</div>}
                <div className='delivery'>Estimasi pengiriman: {product.deliveryTime}</div>
              </div>

              <ProductOptions product={product} value={selectedOptions} onChange={setSelectedOptions} />
              <ProductQuantity quantity={quantity} setQuantity={setQuantity} max={product.stock || 9999} price={product.price} />

              <div className='actions'>
                <button className='button' onClick={onAddToCart}>Tambah ke Keranjang</button>
                <button className='button primary' onClick={onBuyNow}>Beli Sekarang</button>
              </div>
            </div>

            <ProductTabs product={product} />
            <RelatedProducts current={product} products={staticProducts} />
            <div className='card safety'>
              <h4>Keamanan Transaksi</h4>
              <ul>
                <li>🛡 Transaksi Aman — Dana diproses melalui sistem pembayaran GHub.</li>
                <li>⚡ Pengiriman Cepat — Seller memproses pesanan sesuai estimasi.</li>
                <li>💬 Pusat Bantuan — Hubungi tim GHub jika terjadi masalah.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
