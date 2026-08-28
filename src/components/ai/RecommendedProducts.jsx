import React, { useEffect, useState } from 'react';
import { useAI } from '../../hooks/useAI';
import ProductCard from '../common/ProductCard';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// RecommendedProducts — AI-driven product recommendations for logged-in users.
// ============================================================================

export default function RecommendedProducts({ type = 'personalized', productId = null, limit = 8, title = '✨ Rekomendasi untukmu' }) {
  const { isAuthenticated } = useAuth();
  const { recommend, loading, error } = useAI();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    (async () => {
      const res = await recommend({ type, productId, limit });
      if (mounted && res && res.items) setItems(res.items);
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, type, productId, limit]);

  if (!isAuthenticated) return null;
  if (loading && items.length === 0) return <div className='card' style={{ padding: 16 }}>Memuat rekomendasi...</div>;
  if (error) return null;
  if (items.length === 0) return null;

  return (
    <div className='recommended-products' style={{ margin: '24px 0' }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      <div className='product-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
