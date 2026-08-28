import React, { useEffect, useState } from 'react';
import { useAIAdmin } from '../../hooks/useAIAdmin';

// ============================================================================
// AdminAIPlugins — manage AI provider plugins & enabled state.
// ============================================================================

export default function AdminAIPlugins() {
  const { loading, error, listProviders, getConfig, upsertConfig } = useAIAdmin();
  const [providers, setProviders] = useState([]);
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const provs = await listProviders();
    const cfg = await getConfig();
    if (Array.isArray(provs)) setProviders(provs);
    if (cfg) setConfig(cfg);
  };

  useEffect(() => { load(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const toggleProvider = async (id, current) => {
    const nextConfig = {
      ...(config || {}),
      providers: {
        ...(config?.providers || {}),
        [id]: { ...(config?.providers?.[id] || {}), enabled: !current },
      },
    };
    await upsertConfig(nextConfig);
    setMessage(`Provider ${id} ${!current ? 'diaktifkan' : 'dinonaktifkan'}.`);
    load();
  };

  return (
    <div className='container' style={{ paddingTop: 24 }}>
      <h1 style={{ marginBottom: 4 }}>🔌 AI Plugins / Providers</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Aktifkan atau nonaktifkan penyedia AI (OpenAI, Anthropic, Gemini, Local).</p>

      {message && <div style={{ color: 'var(--accent)', marginBottom: 12 }}>✅ {message}</div>}
      {error && <div style={{ color: '#ff6b6b', marginBottom: 12 }}>⚠️ {error}</div>}
      {loading && <div style={{ marginBottom: 12, color: 'var(--muted)' }}>Memuat...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {providers.map((p) => {
          const enabled = config?.providers?.[p.name]?.enabled ?? p.enabled ?? true;
          return (
            <div key={p.id ?? p.name} className='card' style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong>{p.name}</strong>
                <span style={{ fontSize: 20 }}>{enabled ? '✅' : '⛔'}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                Priority: {p.priority ?? '—'} · Models: {p.modelCount ?? 0}
              </div>
              <button
                className='button small'
                style={{ width: '100%', marginTop: 12, background: enabled ? '#ff6b6b' : 'var(--accent,#7c5cfc)', color: '#fff', border: 'none' }}
                onClick={() => toggleProvider(p.name, enabled)}
                disabled={loading}
              >
                {enabled ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          );
        })}
      </div>

      {providers.length === 0 && !loading && <p style={{ color: 'var(--muted)' }}>Belum ada provider terdaftar.</p>}
    </div>
  );
}
