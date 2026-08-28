import { useEffect, useState } from 'react';
import products from '../data/products';
import api from '../services/api';

export default function useProduct(slug){
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    setError(null);
    (async ()=>{
      try{
        // Hit the slug endpoint correctly
        const res = await api.get(`/products/slug/${encodeURIComponent(slug)}`);
        const product = res?.data?.data || res?.data || null;
        if (mounted) setProduct(product);
      }catch(e){
        // fallback to local static data (dev only)
        const found = products.find(p => p.slug === slug);
        if (mounted) {
          setProduct(found || null);
          if (!found) setError(e?.response?.data?.message || 'Produk tidak ditemukan');
        }
      }finally{ if (mounted) setLoading(false); }
    })();
    return ()=> { mounted = false; };
  }, [slug]);

  return { product, loading, error };
}
