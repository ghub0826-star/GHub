import React, { useEffect, useState } from 'react';
import ProductCard from '../marketplace/ProductCard';
import api from '../../services/api';

/**
 * RelatedProducts — fetches live related products from the API.
 * Falls back to the products prop (static/local) if the API fails.
 *
 * Props:
 *   current  — the current product object (needs .slug, .game, .category)
 *   products — optional static fallback array
 */
export default function RelatedProducts({ current, products: staticFallback = [] }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!current) return;
    let mounted = true;

    const params = {};
    if (current.game)     params.game     = current.game;
    if (current.category) params.category = current.category;
    params.limit = 5;

    api.get('/products', { params })
      .then(r => {
        if (!mounted) return;
        const list = r?.data?.data || r?.data?.products || [];
        // Exclude the current product
        const filtered = list
          .filter(p => p.slug !== current.slug)
          .slice(0, 4);

        if (filtered.length > 0) {
          setRelated(filtered);
        } else {
          // Fallback to static data
          const fallback = staticFallback
            .filter(p => p.slug !== current.slug &&
              (p.gameSlug === current.gameSlug || p.category === current.category))
            .slice(0, 4);
          setRelated(fallback);
        }
      })
      .catch(() => {
        // Fallback to static data on error
        const fallback = staticFallback
          .filter(p => p.slug !== current.slug &&
            (p.gameSlug === current.gameSlug || p.category === current.category))
          .slice(0, 4);
        setRelated(fallback);
      });

    return () => { mounted = false; };
  }, [current?.slug, current?.game, current?.category]);

  if (!related.length) return null;

  return (
    <div className='card related-products' style={{ marginTop: 12 }}>
      <h4>Produk Terkait</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {related.map(r => <ProductCard product={r} key={r.slug || r.id} />)}
      </div>
    </div>
  );
}
