import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import Header from '../../components/Header';
// AnnouncementBar removed per request — top announcement disabled
import Footer from '../../components/Footer';
import SEO from '../../components/seo/SEO';
import { ORG_SCHEMA, WEBSITE_SCHEMA } from '../../config/seoConfig';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const reviewRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // helper to navigate to home and scroll to section
  const goToSection = (id) => {
    if (location.pathname !== '/') {
      navigate(`/${id ? '#' + id : ''}`);
      // navigate will change page; allow Home to handle hash on mount
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filters = ['Semua','Item','Akun','Top Up','Currency','Boosting'];
  const reviews = [
    {name:'Andi', text:'Proses cepat, item langsung masuk. Seller juga responsif.', rating:5, role:'Pembeli'},
    {name:'Rizky', text:'Dashboard seller mudah digunakan dan pencairan dana jelas.', rating:5, role:'Seller'},
    {name:'Sari', text:'Top up instan dan dukungan ramah.', rating:5, role:'Pembeli'},
  ];

  useEffect(() => {
    api.get('/products', { params: { limit: 12 } })
      .then((res) => {
        // Handle both array response and nested data.products
        const productList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        setProducts(productList);
      })
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = Array.isArray(products) ? products.filter((p) => {
    if(filter === 'Semua') return true;
    const key = filter.toLowerCase();
    const cat = (p.category || p.type || '').toLowerCase();
    const tags = (p.tags || []).map(t => String(t).toLowerCase());
    return cat.includes(key) || tags.includes(key) || p.title?.toLowerCase().includes(key);
  }) : [];

  const scrollReviews = (dir=1) => {
    if(!reviewRef.current) return;
    reviewRef.current.scrollBy({left: dir * 320, behavior:'smooth'});
  };

return (
    <div>
      <SEO
        title="GHub - Marketplace Game Aman untuk Item, Akun dan Top Up"
        description="Marketplace game modern untuk membeli dan menjual item, akun, currency, top up, dan layanan game dengan sistem transaksi aman."
        keywords="marketplace game, top up, beli diamond, akun game, jual akun, GHub"
        canonical="/"
        type="website"
        jsonLd={[ORG_SCHEMA, WEBSITE_SCHEMA]}
      />
      <div className='container'>
        <Header />

        <section id='home' className='hero'>
        <div className='left'>
          <div className='hero-kicker'><span className='hero-kicker-dot' /> GHUB / GAMING MARKETPLACE</div>
          <h1>Marketplace Game<br/><span className='hero-gradient-text'>Aman, Cepat & Terpercaya</span></h1>
          <p className='lead'>Beli item, akun, top up game favoritmu dengan sistem escrow terbaik di Indonesia.</p>
          <div className='ctas'>
            <Link to='/marketplace' className='cta-primary'>Jelajahi Marketplace <i className='fa-solid fa-arrow-right' /></Link>
            <Link to='/seller/register' className='cta-outline'>Jadi Seller</Link>
          </div>
          <div className='badges'>
            <div className='badge'><i className='fa-solid fa-shield-halved'></i>Escrow 100% Aman</div>
            <div className='badge'><i className='fa-solid fa-bolt'></i>Transaksi Instan</div>
            <div className='badge'><i className='fa-solid fa-user-check'></i>Seller Terverifikasi</div>
          </div>
        </div>
        {/* hero visual moved into CSS background */}
        <div className='hero-cards'>
          <div className='hero-card'>
            <div className='hero-card-icon'><img src='/assets/product-1.jpg' alt='' /></div>
            <div>
            <strong>Mobile Legends</strong>
            <div style={{color:'var(--muted)',fontSize:13}}>4500+ Produk</div>
            </div>
            <i className='fa-solid fa-arrow-right hero-card-arrow' />
          </div>
          <div className='hero-card'>
            <div className='hero-card-icon delivery-icon'><img src='/assets/speedy.png' alt='' /></div>
            <div>
            <strong>Pengiriman Instan</strong>
            <div style={{color:'var(--muted)',fontSize:13}}>Rata-rata 2-5 menit</div>
            </div>
            <i className='fa-solid fa-arrow-right hero-card-arrow' />
          </div>
        </div>
        </section>

        {/* 4. TRUST & QUICK BENEFITS */}
        <section>
          <div className='trust-row'>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-shield-halved'></i><span>Escrow 100% Aman</span></Link>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-bolt'></i><span>Transaksi Instan</span></Link>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-user-check'></i><span>Seller Terverifikasi</span></Link>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-headset'></i><span>24/7 Support</span></Link>
          </div>
        </section>

      <section id='benefits' style={{marginTop:20}}>
        <div className='section-title'>
          <h2>Categories</h2>
          <Link to='/marketplace' style={{color:'var(--muted)'}}>Lihat Semua →</Link>
        </div>
        <div className='categories'>
          <Link to='/marketplace?category=games' className='category'><div className='icon'><img src='/assets/icon-gamepad.png' alt='' /></div><div>Semua Game</div></Link>
          <Link to='/marketplace?category=accounts' className='category'><div className='icon'><img src='/assets/icon-account.png' alt='' /></div><div>Akun Game</div></Link>
          <Link to='/marketplace?category=items' className='category'><div className='icon'><img src='/assets/icon-item.png' alt='' /></div><div>Item Game</div></Link>
          <Link to='/marketplace?category=top-up' className='category'><div className='icon'><img src='/assets/icon-topup.png' alt='' /></div><div>Top Up</div></Link>
          <Link to='/marketplace?category=currency' className='category'><div className='icon'><img src='/assets/icon-currency.png' alt='' /></div><div>Game Currency</div></Link>
          <Link to='/marketplace?category=boosting' className='category'><div className='icon'><img src='/assets/icon-boost.png' alt='' /></div><div>Boosting</div></Link>
          <Link to='/marketplace?category=gift-cards' className='category'><div className='icon'><img src='/assets/icon-discount.png' alt='' /></div><div>Gift Card</div></Link>
          <Link to='/marketplace' className='category'><div className='icon'><img src='/assets/icon-more.png' alt='' /></div><div>Lainnya</div></Link>
        </div>
      </section>

      {/* POPULAR GAMES (desktop: show up to 8, mobile: horizontal scroll) */}
      <section id='categories' style={{marginTop:18}}>
        <div className='section-title'>
          <h2>Game Populer</h2>
          <Link to='/marketplace' style={{color:'var(--muted)'}}>Lihat Semua →</Link>
        </div>
        <div className='popular-games'>
          {products.slice(0,8).map((p) => (
            <Link key={'game-'+p.id} to='/marketplace?category=games' className='popular-card'>
              <div className='popular-card-image'><img src={p.image || `/assets/product-${p.id}.jpg`} alt='' /></div>
              <div>
                <strong style={{display:'block'}}>{p.title}</strong>
                <div style={{color:'var(--muted)'}}>{(p.count || 1200)+' Produk'}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id='games' style={{marginTop:18}}>
        <div className='section-title'>
          <h2>Top Seller</h2>
          <Link to='/seller/register' style={{color:'var(--muted)'}}>Lihat Semua →</Link>
        </div>
          <div className='top-sellers'>
            <Link to='/marketplace' className='seller-card'>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className='seller-avatar'><img src='/assets/top-seller-1.jpg' alt='Pro Gamer Store' /></div>
                <div>
                  <strong>Pro Gamer Store <span style={{color:'var(--accent)',marginLeft:6}}>✓</span></strong>
                  <div className='seller-meta'>⭐ 5.0 (1.250) • 12.500+ Sales • Respons 1 jam</div>
                </div>
              </div>
            </Link>
            <Link to='/marketplace' className='seller-card'>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className='seller-avatar'><img src='/assets/product-2.jpg' alt='GG Best Store' /></div>
                <div>
                  <strong>GG Best Store <span style={{color:'var(--accent)',marginLeft:6}}>✓</span></strong>
                  <div className='seller-meta'>⭐ 4.9 (430) • 4.300+ Sales • Respons 2 jam</div>
                </div>
              </div>
            </Link>
          </div>
      </section>
      </div>

      <div className='container'>
        <section id='products' style={{marginTop:18}}>
          <div className='section-title'>
            <div>
              <h2>Produk Populer</h2>
              <div style={{color:'var(--muted)',fontSize:12}}>Produk terlaris dari seller terpercaya</div>
            </div>
            <Link to='/marketplace' style={{color:'var(--muted)'}}>Lihat Semua →</Link>
          </div>

          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12,flexWrap:'wrap'}}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={"cta-outline" + (filter===f? ' active-filter':'' )} style={{padding:'8px 10px'}}>{f}</button>
            ))}
          </div>

          <div className='products-grid'>
            {filteredProducts.length === 0 ? <div className='product-card card'><p style={{color:'var(--muted)'}}>Tidak ada produk.</p></div> : filteredProducts.map((p) => (
              <Link key={'grid-'+p.id} to={`/product/${p.slug || p.id}`} className='product-card'>
                <img src={p.image || `/assets/product-${p.id}.jpg`} alt={p.title} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/pop${p.id}/400/200`; }} />
                <h4 style={{margin:'8px 0 4px'}}>{p.title}</h4>
                <div style={{color:'var(--muted)',fontSize:13}}>⚡ {p.delivery || 'Pengiriman Instan'} • ⭐ {(p.rating||4.9)} ({p.reviews||1250})</div>
                <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700}}>Rp {Number(p.price||0).toLocaleString()}</div>
                  <div style={{textAlign:'right',fontSize:12,color:'var(--muted)'}}>
                    {p.seller?.name || 'Pro Gamer Store'} {p.seller?.verified ? '✓' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id='promo' style={{marginTop:18}}>
          <div className='section-title'>
            <h2>Promo & Diskon</h2>
            <Link to='/marketplace' style={{color:'var(--muted)'}}>Lihat Semua →</Link>
          </div>
          <div className='promo-row'>
            <Link to='/marketplace' className='promo-card'>
              <h3>Diskon Spesial</h3>
              <p style={{color:'var(--muted)'}}>Hingga 20% untuk top up game tertentu.</p>
            </Link>
            <Link to='/marketplace' className='promo-card'>
              <h3>Bundle Hemat</h3>
              <p style={{color:'var(--muted)'}}>Paket item + boost dengan potongan harga.</p>
            </Link>
          </div>
        </section>

        <section id='sellers' style={{marginTop:18}}>
          <div className='section-title'>
            <h2>Top Seller</h2>
            <Link to='/seller/register' style={{color:'var(--muted)'}}>Lihat Semua →</Link>
          </div>
          <div className='top-sellers'>
            <Link to='/marketplace' className='seller-card'>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className='avatar'>P</div>
                <div>
                  <strong>Pro Gamer Store</strong>
                  <div style={{color:'var(--muted)'}}>12.500+ Sales</div>
                </div>
              </div>
            </Link>
            <Link to='/marketplace' className='seller-card'>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className='avatar'>G</div>
                <div>
                  <strong>GG Best Store</strong>
                  <div style={{color:'var(--muted)'}}>4.300+ Sales</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section id='how-it-works' style={{marginTop:18}}>
          <div className='section-title'><h2>Cara Kerja GHub</h2></div>
          <div className='how-it-works'>
            <Link to='/help' className='how-step'><i className='fa-solid fa-magnifying-glass' style={{fontSize:24}}></i><div>1. Cari produk</div></Link>
            <Link to='/help' className='how-step'><i className='fa-solid fa-credit-card' style={{fontSize:24}}></i><div>2. Bayar aman via escrow</div></Link>
            <Link to='/help' className='how-step'><i className='fa-solid fa-gamepad' style={{fontSize:24}}></i><div>3. Terima barang / layanan</div></Link>
          </div>
        </section>

        <section id='security' style={{marginTop:18}}>
          <div className='section-title'><h2>Keunggulan & Keamanan</h2></div>
          <div className='advantages'>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-shield-halved'></i><div><strong>Transaksi Aman</strong><div style={{color:'var(--muted)'}}>Dana ditahan selama proses pesanan</div></div></Link>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-bolt'></i><div><strong>Pengiriman Cepat</strong><div style={{color:'var(--muted)'}}>Produk instan tersedia 24 jam</div></div></Link>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-user-check'></i><div><strong>Seller Terverifikasi</strong><div style={{color:'var(--muted)'}}>Seller melewati proses pemeriksaan</div></div></Link>
            <Link to='/help' className='trust-item'><i className='fa-solid fa-headset'></i><div><strong>Bantuan 24/7</strong><div style={{color:'var(--muted)'}}>Tim support siap membantu</div></div></Link>
          </div>
        </section>

        <section id='reviews' style={{marginTop:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div className='section-title'><h2>Testimoni</h2></div>
          </div>
          <div ref={reviewRef} className='testimonial-row'>
            {reviews.map((r, idx) => (
              <div className='testimonial' key={idx}>
                <div className='who'>{r.name} — <small style={{color:'var(--muted)'}}>{r.role}</small></div>
                <div style={{color:'var(--accent)',margin:'6px 0'}}>{'★'.repeat(r.rating)}</div>
                <p style={{color:'var(--muted)'}}>{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id='become-seller' style={{marginTop:18}}>
          <div className='cta-large'>
            <div>
              <h2>Mulai Berjualan di GHub</h2>
              <p style={{color:'rgba(255,255,255,0.9)',maxWidth:520}}>Jangkau ribuan gamer dan kelola penjualan dari satu dashboard dengan proses cepat dan aman.</p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:18}}>
                <div className='stat-card'>
                  <div className='stat-number'>10.000+</div>
                  <div className='stat-label'>Pembeli</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>5.000+</div>
                  <div className='stat-label'>Produk</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>500+</div>
                  <div className='stat-label'>Seller</div>
                </div>
              </div>
            </div>
            <div>
              <Link to='/seller/register' className='button'>Daftar Jadi Seller</Link>
            </div>
          </div>
        </section>

        <section id='faq' style={{marginTop:18}}>
          <div className='section-title'><h2>Berita & Panduan Game</h2><Link to='/help' style={{color:'var(--muted)'}}>Lihat Semua →</Link></div>
          <div className='blog-row'>
            <Link to='/help' className='blog-card'>
              <img src='/assets/blog1.jpg' alt='Tips aman beli akun' style={{width:'100%',borderRadius:12,marginBottom:12}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/blog1/360/220'; }} />
              <h4>Tips aman beli akun</h4>
            </Link>
            <Link to='/help' className='blog-card'>
              <img src='/assets/blog2.jpg' alt='Game baru populer' style={{width:'100%',borderRadius:12,marginBottom:12}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/blog2/360/220'; }} />
              <h4>Game baru populer</h4>
            </Link>
            <Link to='/help' className='blog-card'>
              <img src='/assets/blog3.jpg' alt='Cara jual di GHub' style={{width:'100%',borderRadius:12,marginBottom:12}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/blog3/360/220'; }} />
              <h4>Cara jual di GHub</h4>
            </Link>
          </div>
        </section>

        <section style={{marginTop:18}}>
          <div className='section-title'><h2>Pertanyaan yang Sering Ditanyakan</h2><Link to='/help' style={{color:'var(--muted)'}}>Lihat Semua →</Link></div>
          <div className='faq'>
            <Link to='/help' className='faq-item'><strong>Apakah transaksi di GHub aman?</strong></Link>
            <Link to='/help' className='faq-item'><strong>Kapan seller menerima dana?</strong></Link>
            <Link to='/help' className='faq-item'><strong>Bagaimana cara menjadi seller?</strong></Link>
            <Link to='/help' className='faq-item'><strong>Bagaimana jika produk tidak diterima?</strong></Link>
            <Link to='/help' className='faq-item'><strong>Apakah bisa mengajukan refund?</strong></Link>
            <Link to='/help' className='faq-item'><strong>Metode pembayaran apa yang tersedia?</strong></Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
