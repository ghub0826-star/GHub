import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MarketplaceHeader from '../../components/marketplace/MarketplaceHeader';
import MarketplaceSearch from '../../components/marketplace/MarketplaceSearch';
import MarketplaceFilters from '../../components/marketplace/MarketplaceFilters';
import ProductGrid from '../../components/marketplace/ProductGrid';
import Pagination from '../../components/marketplace/Pagination';
import { filterAndSortProducts } from '../../utils/filterProducts';
import productsData from '../../data/products';
import SEO from '../../components/seo/SEO';
import { APP_URL } from '../../config/seoConfig';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Marketplace.css';

function useQuery(){
  const { search } = useLocation();
  return useMemo(()=> new URLSearchParams(search), [search]);
}

export default function Marketplace(){
  const navigate = useNavigate();
  const location = useLocation();
  const params = useQuery();


  // Controlled state derived from URL
  const q = params.get('q') || '';
  const category = params.get('category') || 'all';
  const game = params.get('game') || 'all';
  const priceMin = params.get('priceMin') || '';
  const priceMax = params.get('priceMax') || '';
  const seller = params.get('seller') || 'all';
  const delivery = params.get('delivery') || 'all';
  const sort = params.get('sort') || 'new';
  const page = Number(params.get('page') || 1);

  const [loading, setLoading] = useState(false);

  // When user changes UI, push new URL
  const applyParams = (patch) => {
    const p = new URLSearchParams(location.search);
    Object.keys(patch).forEach(k=>{
      const v = patch[k];
      if (v === null || v === undefined || v === '') p.delete(k);
      else p.set(k, v);
    });
    navigate(`/marketplace?${p.toString()}`);
  };

  const handleSearch = (term) => {
    if (!term || !term.trim()) return;
    applyParams({ q: term.trim(), page: 1 });
  };

  const handleFilters = (vals) => {
    applyParams({
      category: vals.category || 'all',
      game: vals.game || 'all',
      priceMin: vals.priceMin || '',
      priceMax: vals.priceMax || '',
      seller: vals.seller || 'all',
      delivery: vals.delivery || 'all',
      sort: vals.sort || 'new',
      page: 1
    });
  };

  const handleReset = () => {
    navigate('/marketplace');
  };

  // Simulate API fetch with loading
  const [results, setResults] = useState({ total:0, results: [] });
  useEffect(()=>{
    setLoading(true);
    const t = setTimeout(()=>{
      const { total, results } = filterAndSortProducts(productsData, { q, category, game, priceMin, priceMax, seller, delivery, sort, page, perPage:12 });
      setResults({ total, results });
      setLoading(false);
    }, 300);
    return ()=> clearTimeout(t);
  }, [q, category, game, priceMin, priceMax, seller, delivery, sort, page]);

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${APP_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${APP_URL}/marketplace` },
    ],
  };

  return (
    <div className='marketplace-page container'>
      <Header />
      <SEO
        title="Marketplace Game | Beli Item, Akun dan Top Up - GHub"
        description="Temukan produk game dari Seller terverifikasi. Gunakan pencarian, filter, kategori, dan sistem transaksi aman."
        keywords="marketplace game, top up game, beli item game, akun game, seller game"
        canonical="/marketplace"
        type="website"
        jsonLd={[breadcrumbSchema]}
      />
      <MarketplaceHeader />
      <div className='marketplace-top'>
        <MarketplaceSearch initial={q} onSearch={handleSearch} />
        <div className='marketplace-controls'>
          <MarketplaceFilters values={{category, game, priceMin, priceMax, seller, delivery, sort}} onChange={handleFilters} onReset={handleReset} />
        </div>
      </div>

      <div className='marketplace-results'>
        <ProductGrid products={results.results} loading={loading} />
        <div className='marketplace-footer'>
          <div className='results-info'>Menampilkan {results.results.length} dari {results.total} produk</div>
          <Pagination page={page} total={results.total} perPage={12} onChange={(p)=> applyParams({page: p})} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
