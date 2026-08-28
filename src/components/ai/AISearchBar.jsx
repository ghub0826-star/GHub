import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import ProductCard from '../common/ProductCard';

// ============================================================================
// AISearchBar — semantic search over products using the AI search endpoint.
// Renders understanding tag + product grid of results.
// ============================================================================

export default function AISearchBar() {
  const { search, loading, error } = useAI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    const res = await search({ query: q, limit: 12 });
    if (res) setResults(res);
  };

  return (
    <div className='ai-search-bar'>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Cari pakai AI: "akun ML murah level tinggi"'
          style={{ flex: 1 }}
        />
        <button className='button small' disabled={loading}>
          {loading ? 'Mencari...' : '✨ Cari AI'}
        </button>
      </form>

      {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginTop: 8 }}>⚠️ {error}</div>}

      {results && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>
            {results.understanding && (
              <span style={{ background: 'rgba(124,92,252,.15)', padding: '2px 8px', borderRadius: 8, marginRight: 8 }}>
                🧠 {results.understanding}
              </span>
            )}
            {results.fallback && <span>⚙️ hasil standar</span>}
          </div>
          <div className='product-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {(results.items || []).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {results.items && results.items.length === 0 && <div>Produk tidak ditemukan.</div>}
        </div>
      )}
    </div>
  );
}
