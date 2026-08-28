import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';

// ============================================================================
// AISupportCard — AI-driven support assistant. Answers questions and escalates
// to human support when needed.
// ============================================================================

export default function AISupportCard() {
  const { support, loading, error } = useAI();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setResult(null);
    const res = await support({ query: q });
    if (res) setResult(res);
  };

  return (
    <div className='card' style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 8 }}>💬 Pusat Bantuan AI</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
        Tanyakan cara transaksi, status pesanan, refund, atau masalah akun.
      </p>
      <form onSubmit={handleAsk} style={{ display: 'flex', gap: 6 }}>
        <input
          type='text'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Misal: Bagaimana cara refund?'
        />
        <button className='button small' disabled={loading}>{loading ? '...' : 'Tanya'}</button>
      </form>

      {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginTop: 10 }}>⚠️ {error}</div>}

      {result && (
        <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 12 }}>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{result.answer}</div>
          {!result.resolved && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>
              ☎️ {result.escalation_message || 'Silakan hubungi tim dukungan bila perlu bantuan lebih lanjut.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
