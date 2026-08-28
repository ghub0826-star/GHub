import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// SellerAssistantPanel — AI assistant for sellers: pricing suggestions,
// product moderation guidance, and general seller assistance.
// ============================================================================

export default function SellerAssistantPanel() {
  const { user } = useAuth();
  const { sellerAssistant, pricing, moderate, loading, error } = useAI();
  const [mode, setMode] = useState('assist');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  if (!user || user.role !== 'SELLER') return null;

  const handleRun = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setResult(null);
    let res = null;
    if (mode === 'pricing') res = await pricing({ query: text });
    else if (mode === 'moderate') res = await moderate({ content: text });
    else res = await sellerAssistant({ query: text });
    if (res) setResult(res);
  };

  return (
    <div className='card' style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 8 }}>🛠️ Asisten Seller AI</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
        Bantuan untuk menetapkan harga, memeriksa kelayakan produk, dan tips berjualan.
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[
          { key: 'assist', label: '💡 Asisten' },
          { key: 'pricing', label: '💰 Harga' },
          { key: 'moderate', label: '🛡️ Moderasi' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className='button small'
            style={{
              background: mode === m.key ? 'var(--accent,#7c5cfc)' : 'transparent',
              color: '#fff', border: '1px solid rgba(255,255,255,.12)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleRun} style={{ display: 'flex', gap: 6 }}>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === 'pricing'
              ? 'Misal: berapa harga wajar akun ML 100 skin?'
              : mode === 'moderate'
                ? 'Tempel deskripsi produk untuk diperiksa...'
                : 'Tanyakan tips berjualan...'
          }
        />
        <button className='button small' disabled={loading}>{loading ? '...' : 'Jalankan'}</button>
      </form>

      {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginTop: 10 }}>⚠️ {error}</div>}

      {result && (
        <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 12, whiteSpace: 'pre-wrap', fontSize: 14 }}>
          {result.answer || result.suggestion || result.recommendation || JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
