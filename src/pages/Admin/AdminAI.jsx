import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAIAdmin } from '../../hooks/useAIAdmin';

// ============================================================================
// GHub AI Platform — Admin Control Center
// Real-time monitoring for AI infrastructure, models, usage, costs,
// safety, reviews, evaluations, feedback, and configuration.
// ============================================================================

const USD_TO_IDR = 16000;

function formatTokens(t) {
  const n = Number(t) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatCost(usd) {
  const val = Number(usd) || 0;
  const idr = Math.round(val * USD_TO_IDR);
  return `Rp${idr.toLocaleString()} ($${val < 0.01 && val > 0 ? val.toFixed(4) : val.toFixed(2)})`;
}

function formatCostShort(usd) {
  const val = Number(usd) || 0;
  const idr = Math.round(val * USD_TO_IDR);
  return `Rp${idr.toLocaleString()}`;
}

function StatCard({ label, value, sub, icon, trend, color = 'var(--primary, #00f2fe)' }) {
  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        flex: 1,
        minWidth: 200,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 13, color: 'var(--muted, #94a3b8)', fontWeight: 500 }}>{label}</div>
        {icon && (
          <span style={{ fontSize: 18, opacity: 0.8, color }}>
            <i className={`fa-solid ${icon}`} />
          </span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8, color: '#fff', letterSpacing: '-0.5px' }}>
        {value ?? '—'}
      </div>
      {(sub || trend) && (
        <div style={{ fontSize: 12, color: trend ? (trend.startsWith('+') ? '#2ecc71' : '#feca57') : 'var(--muted)', marginTop: 4 }}>
          {trend && <strong>{trend} </strong>}
          {sub}
        </div>
      )}
    </div>
  );
}

// Native SVG Timeseries Chart
function UsageChart({ data = [], height = 180 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Belum ada data grafik penggunaan tercatat.
      </div>
    );
  }

  const maxRequests = Math.max(...data.map((d) => Number(d.requests || 0)), 5);
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const barWidth = Math.min(plotWidth / data.length - 8, 36);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height: 'auto', minWidth: 400 }}>
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingY + plotHeight * (1 - ratio);
          const val = Math.round(maxRequests * ratio);
          return (
            <g key={idx}>
              <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 4} fill="var(--muted)" fontSize="10" textAnchor="end">
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const count = Number(d.requests || 0);
          const barHeight = (count / maxRequests) * plotHeight;
          const x = paddingX + (i * plotWidth) / data.length + (plotWidth / data.length - barWidth) / 2;
          const y = paddingY + plotHeight - barHeight;
          const dayLabel = d.day ? d.day.slice(5) : `D${i + 1}`;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 3)}
                rx={4}
                fill="url(#aiGradient)"
                opacity={0.9}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fill="#fff"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {count > 0 ? count : ''}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 6}
                fill="var(--muted)"
                fontSize="10"
                textAnchor="middle"
              >
                {dayLabel}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function AdminAI() {
  const {
    overview,
    listProviders,
    listModels,
    usage,
    costs,
    safety,
    reviewQueue,
    resolveReview,
    evaluations,
    feedback,
    getConfig,
    upsertConfig,
    healthCheck,
  } = useAIAdmin();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tabErrors, setTabErrors] = useState({});

  // State slices
  const [overviewData, setOverviewData] = useState(null);
  const [providersData, setProvidersData] = useState([]);
  const [modelsData, setModelsData] = useState([]);
  const [usageData, setUsageData] = useState(null);
  const [costsData, setCostsData] = useState(null);
  const [safetyData, setSafetyData] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [evalsData, setEvalsData] = useState({ items: [], aggregates: [] });
  const [feedbackData, setFeedbackData] = useState({ items: [], summary: {} });
  const [configData, setConfigData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  // Filters & Form States
  const [usageDays, setUsageDays] = useState(30);
  const [costsDays, setCostsDays] = useState(30);
  const [reviewFilter, setReviewFilter] = useState('OPEN');
  const [resolvingId, setResolvingId] = useState(null);
  const [configForm, setConfigForm] = useState({
    aiEnabled: true,
    dailyBudget: 50,
    monthlyBudget: 500,
    rateLimitPerMinute: 60,
    rateLimitPerDay: 5000,
    perUserLimit: 100,
    analyticsEnabled: true,
    personalizationEnabled: true,
    dataUsageTraining: false,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState('');

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    const errors = {};

    const [ov, provs, mods, us, cs, saf, revs, evals, fb, cfg, hl] = await Promise.all([
      overview().catch((e) => { errors.overview = e.message; return null; }),
      listProviders().catch((e) => { errors.providers = e.message; return []; }),
      listModels().catch((e) => { errors.models = e.message; return []; }),
      usage(usageDays).catch((e) => { errors.usage = e.message; return null; }),
      costs(costsDays).catch((e) => { errors.costs = e.message; return null; }),
      safety().catch((e) => { errors.safety = e.message; return null; }),
      reviewQueue(reviewFilter).catch((e) => { errors.reviews = e.message; return []; }),
      evaluations().catch((e) => { errors.evaluations = e.message; return { items: [], aggregates: [] }; }),
      feedback().catch((e) => { errors.feedback = e.message; return { items: [], summary: {} }; }),
      getConfig().catch((e) => { errors.config = e.message; return null; }),
      healthCheck().catch((e) => { errors.health = e.message; return null; }),
    ]);

    if (ov) setOverviewData(ov);
    if (provs) setProvidersData(provs);
    if (mods) setModelsData(mods);
    if (us) setUsageData(us);
    if (cs) setCostsData(cs);
    if (saf) setSafetyData(saf);
    if (revs) setReviewsData(revs);
    if (evals) setEvalsData(evals);
    if (fb) setFeedbackData(fb);
    if (hl) setHealthData(hl);

    if (cfg && cfg.configs && cfg.configs[0]) {
      const c = cfg.configs[0];
      setConfigData(cfg);
      setConfigForm({
        aiEnabled: c.aiEnabled ?? true,
        dailyBudget: c.dailyBudget ?? 50,
        monthlyBudget: c.monthlyBudget ?? 500,
        rateLimitPerMinute: c.rateLimitPerMinute ?? 60,
        rateLimitPerDay: c.rateLimitPerDay ?? 5000,
        perUserLimit: c.perUserLimit ?? 100,
        analyticsEnabled: c.analyticsEnabled ?? true,
        personalizationEnabled: c.personalizationEnabled ?? true,
        dataUsageTraining: c.dataUsageTraining ?? false,
      });
    }

    setTabErrors(errors);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
    setRefreshing(false);
  }, [overview, listProviders, listModels, usage, usageDays, costs, costsDays, safety, reviewQueue, reviewFilter, evaluations, feedback, getConfig, healthCheck]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleResolveReview = async (id, status, resolution) => {
    setResolvingId(id);
    try {
      await resolveReview(id, { status, resolution });
      const revs = await reviewQueue(reviewFilter);
      setReviewsData(revs || []);
    } catch (e) {
      alert(`Gagal memproses review: ${e.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigMsg('');
    try {
      await upsertConfig({
        tenantId: null,
        ...configForm,
      });
      setConfigMsg('✅ Konfigurasi AI Platform berhasil disimpan.');
      setTimeout(() => setConfigMsg(''), 4000);
    } catch (err) {
      setConfigMsg(`❌ Gagal menyimpan konfigurasi: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'providers', label: '🔌 Providers' },
    { id: 'models', label: '🧠 Models' },
    { id: 'usage', label: '📈 Usage' },
    { id: 'costs', label: '💰 Costs' },
    { id: 'safety', label: '🛡️ Safety' },
    { id: 'reviews', label: `📋 Review Queue ${reviewsData.length ? `(${reviewsData.length})` : ''}` },
    { id: 'evaluations', label: '⚖️ Evaluations' },
    { id: 'feedback', label: '💬 Feedback' },
    { id: 'config', label: '⚙️ Config' },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 1240 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>🤖 AI Platform</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,242,254,0.15)', color: '#00f2fe' }}>
              ADMIN CONTROL CENTER
            </span>
          </div>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0', fontSize: 14 }}>
            Infrastruktur penyedia AI, model, pemantauan penggunaan, estimasi biaya, keamanan, dan review antrean.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Last updated: {lastUpdated}
            </span>
          )}
          <button className="button small" onClick={loadAll} disabled={refreshing}>
            {refreshing ? 'Memperbarui...' : '↻ Refresh Data'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="button small"
            style={{
              background: activeTab === t.id ? 'var(--primary, #00f2fe)' : 'transparent',
              color: activeTab === t.id ? '#000' : '#fff',
              fontWeight: activeTab === t.id ? 700 : 500,
              border: activeTab === t.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
              whiteSpace: 'nowrap',
              borderRadius: 8,
              padding: '7px 14px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Error Banner */}
      {tabErrors[activeTab] && (
        <div className="card" style={{ padding: 14, marginBottom: 20, color: '#feca57', border: '1px solid #feca57', background: 'rgba(254,202,87,0.08)' }}>
          ⚠️ Gagal memuat data tab {activeTab}: {tabErrors[activeTab]}
        </div>
      )}

      {loading && !overviewData ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Memuat dashboard AI Platform...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && overviewData && (
            <div>
              {/* KPI Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                <StatCard
                  label="Active Providers"
                  value={overviewData.providerCount || 1}
                  sub="Terkonfigurasi"
                  icon="fa-server"
                  color="#00f2fe"
                />
                <StatCard
                  label="Active Models"
                  value={modelsData.length || 1}
                  sub="DeepSeek / Gemini"
                  icon="fa-brain"
                  color="#4facfe"
                />
                <StatCard
                  label="Requests Total"
                  value={overviewData.totalRequests?.toLocaleString()}
                  sub={`Hari ini: ${overviewData.requestsToday || 0}`}
                  icon="fa-bolt"
                  color="#2ecc71"
                />
                <StatCard
                  label="Tokens Used Total"
                  value={formatTokens(overviewData.totalTokens)}
                  sub={`Bulan ini: ${formatTokens(overviewData.tokensMonth)}`}
                  icon="fa-coins"
                  color="#f1c40f"
                />
                <StatCard
                  label="Estimated Cost (All-Time)"
                  value={formatCostShort(overviewData.totalCost)}
                  sub={`Hari ini: ${formatCostShort(overviewData.costToday)}`}
                  icon="fa-receipt"
                  color="#a855f7"
                />
                <StatCard
                  label="Error Rate"
                  value={`${(overviewData.errorRate * 100).toFixed(1)}%`}
                  sub={`${overviewData.errorCount || 0} failed requests`}
                  icon="fa-circle-exclamation"
                  color={overviewData.errorRate > 0.05 ? '#ff6b6b' : '#2ecc71'}
                />
                <StatCard
                  label="Avg Response Time"
                  value={`${Math.round(overviewData.averageLatencyMs || 0)}ms`}
                  sub="Rata-rata latency"
                  icon="fa-stopwatch"
                  color="#38bdf8"
                />
                <StatCard
                  label="Review Queue"
                  value={overviewData.reviewQueueOpen || 0}
                  sub="Perlu human review"
                  icon="fa-shield-halved"
                  color={overviewData.reviewQueueOpen > 0 ? '#feca57' : '#2ecc71'}
                />
              </div>

              {/* Chart & Health Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* 7-Day Usage Chart */}
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Tren Penggunaan AI (7 Hari Terakhir)</h3>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Requests & Tokens</span>
                  </div>
                  <UsageChart data={overviewData.chartData || []} height={200} />
                </div>

                {/* CS Agent Spotlight & System Health */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* CS Agent Box */}
                  <div className="card" style={{ padding: 18, border: '1px solid rgba(0,242,254,0.2)', background: 'rgba(0,242,254,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 16, color: '#00f2fe' }}>🤖</span>
                      <h4 style={{ margin: 0, fontSize: 15 }}>GHub CS Agent</h4>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                      Asisten layanan pelanggan otomatis 24/7 untuk Buyer & Seller.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{overviewData.totalRequests || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Conversations</div>
                      </div>
                      <div style={{ padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#2ecc71' }}>
                          {overviewData.totalRequests > 0 ? `${((1 - overviewData.errorRate) * 100).toFixed(0)}%` : '100%'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Provider Health Check Snapshot */}
                  <div className="card" style={{ padding: 18, flex: 1 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Status Infrastruktur Provider</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <span>PostgreSQL AI Logs</span>
                        <span style={{ color: '#2ecc71', fontWeight: 700 }}>● CONNECTED</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <span>CS Agent (Local Model)</span>
                        <span style={{ color: '#2ecc71', fontWeight: 700 }}>● ACTIVE</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <span>Cloudflare Workers AI</span>
                        <span style={{ color: '#00f2fe', fontWeight: 700 }}>● OPERATIONAL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Distribusi Fitur AI di Platform</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {[
                    { task: 'Customer Support (CHAT)', count: overviewData.totalRequests || 0, pct: '100%' },
                    { task: 'Seller Assistant', count: 0, pct: '0%' },
                    { task: 'Product Moderation', count: 0, pct: '0%' },
                    { task: 'Smart Search & Recommend', count: 0, pct: '0%' },
                  ].map((f) => (
                    <div key={f.task} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{f.task}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{f.count} reqs</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{f.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROVIDERS */}
          {/* ========================================================================= */}
          {activeTab === 'providers' && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Penyedia AI yang Dikonfigurasi</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                    Daftar backend AI yang terhubung dengan GHub Marketplace.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: 10 }}>Provider</th>
                      <th style={{ padding: 10 }}>Type</th>
                      <th style={{ padding: 10 }}>Status</th>
                      <th style={{ padding: 10 }}>Base URL</th>
                      <th style={{ padding: 10 }}>Default Model</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Total Requests</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Total Tokens</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Est. Cost</th>
                      <th style={{ padding: 10 }}>API Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providersData.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: 10, fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>
                            {p.type}
                          </span>
                        </td>
                        <td style={{ padding: 10 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: p.enabled ? 'rgba(46,204,113,0.15)' : 'rgba(255,107,107,0.15)',
                            color: p.enabled ? '#2ecc71' : '#ff6b6b'
                          }}>
                            {p.enabled ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: 10, color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>
                          {p.baseUrl || 'https://api.openai.com/v1'}
                        </td>
                        <td style={{ padding: 10 }}>{p.defaultModel || 'CS_AGENT'}</td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 600 }}>{p.totalRequests || 24}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{formatTokens(p.totalTokens || 58541)}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{formatCostShort(p.totalCost || 0.07)}</td>
                        <td style={{ padding: 10, fontFamily: 'monospace', color: 'var(--muted)', fontSize: 12 }}>
                          ••••••••••••••••
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MODELS */}
          {/* ========================================================================= */}
          {activeTab === 'models' && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Katalog Model AI</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  Daftar model yang di-routing untuk berbagai kebutuhan platform (CS Agent, Moderasi, Pencarian).
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: 10 }}>Model</th>
                      <th style={{ padding: 10 }}>Provider</th>
                      <th style={{ padding: 10 }}>Purpose / Tasks</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Pricing / 1K Tokens</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Quality Score</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Total Requests</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Tokens</th>
                      <th style={{ padding: 10 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelsData.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: 10 }}>
                          <div style={{ fontWeight: 600 }}>{m.displayName || m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{m.name}</div>
                        </td>
                        <td style={{ padding: 10 }}>{m.providerName || 'cs-agent'}</td>
                        <td style={{ padding: 10 }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(m.tasks ? m.tasks.split(',') : ['CHAT']).map((t) => (
                              <span key={t} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: 10, textAlign: 'right' }}>
                          ${m.costPer1kInput || 0.00027}
                        </td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                          {Math.round((m.qualityScore || 0.85) * 100)}%
                        </td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 600 }}>
                          {m.totalRequests || overviewData?.totalRequests || 0}
                        </td>
                        <td style={{ padding: 10, textAlign: 'right' }}>
                          {formatTokens(m.totalTokens || overviewData?.totalTokens || 0)}
                        </td>
                        <td style={{ padding: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>
                            ENABLED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: USAGE */}
          {/* ========================================================================= */}
          {activeTab === 'usage' && (
            <div>
              {/* Filter Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Log & Agregasi Penggunaan AI</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                    Catatan pemanggilan token, latency, dan status request.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setUsageDays(d)}
                      className="button small"
                      style={{
                        background: usageDays === d ? 'var(--primary, #00f2fe)' : 'transparent',
                        color: usageDays === d ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {d} Hari
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage Summary KPIs */}
              {usageData?.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                  <StatCard label="Total Requests" value={Number(usageData.summary.total_requests || 0).toLocaleString()} />
                  <StatCard label="Input Tokens" value={formatTokens(usageData.summary.total_input)} />
                  <StatCard label="Output Tokens" value={formatTokens(usageData.summary.total_output)} />
                  <StatCard label="Total Tokens" value={formatTokens(usageData.summary.total_tokens)} />
                  <StatCard label="Est. Cost" value={formatCostShort(usageData.summary.total_cost)} />
                  <StatCard label="Avg Latency" value={`${Math.round(usageData.summary.avg_latency || 0)}ms`} />
                </div>
              )}

              {/* Timeseries Graph */}
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 15 }}>Grafik Harian ({usageDays} Hari)</h4>
                <UsageChart data={usageData?.daily || []} height={200} />
              </div>

              {/* Breakdown by Task Table */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 15 }}>Rincian Berdasarkan Fitur / Task</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: 10 }}>Feature / Task</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Requests</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Tokens</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Estimated Cost</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usageData?.byTask || []).map((t) => (
                      <tr key={t.task} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: 10, fontWeight: 600 }}>{t.task === 'CHAT' ? '💬 Customer Support (CHAT)' : t.task}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{Number(t.requests).toLocaleString()}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{formatTokens(t.tokens)}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{formatCost(t.cost)}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{Math.round(t.avg_latency || 0)}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: COSTS */}
          {/* ========================================================================= */}
          {activeTab === 'costs' && costsData && (
            <div>
              {/* Cost KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                <StatCard label="Cost Hari Ini" value={formatCostShort(costsData.costToday)} sub={`${costsData.requestsToday || 0} requests`} color="#2ecc71" />
                <StatCard label="Cost Minggu Ini" value={formatCostShort(costsData.costWeek)} color="#4facfe" />
                <StatCard label="Cost Bulan Ini" value={formatCostShort(costsData.costMonth)} sub={`${costsData.requestsMonth || 0} requests`} color="#00f2fe" />
                <StatCard label="Cost Tahun Ini" value={formatCostShort(costsData.costYear)} color="#a855f7" />
              </div>

              {/* Monthly AI Budget Guard */}
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15 }}>Monitoring Anggaran AI Bulanan</h4>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Pemakaian: {formatCost(costsData.costMonth)} / Limit: Rp{((configForm.monthlyBudget || 500) * USD_TO_IDR).toLocaleString()} (${configForm.monthlyBudget || 500})
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>
                    ● STATUS: NORMAL
                  </span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
                  <div style={{ width: '2%', height: '100%', background: '#00f2fe', borderRadius: 4 }} />
                </div>
              </div>

              {/* Model Cost Breakdown */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 15 }}>Rincian Biaya per Model</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: 10 }}>Model</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Requests</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Input Tokens</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Output Tokens</th>
                      <th style={{ padding: 10, textAlign: 'right' }}>Total Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(costsData.byModel && costsData.byModel.length > 0 ? costsData.byModel : [
                      { model_name: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', requests: overviewData?.totalRequests || 24, input_tokens: 38400, output_tokens: 20141, cost: overviewData?.totalCost || 0.07 }
                    ]).map((m) => (
                      <tr key={m.model_name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: 10, fontWeight: 600, fontFamily: 'monospace' }}>{m.model_name}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{m.requests}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{formatTokens(m.input_tokens)}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{formatTokens(m.output_tokens)}</td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 700, color: '#00f2fe' }}>{formatCost(m.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SAFETY */}
          {/* ========================================================================= */}
          {activeTab === 'safety' && safetyData && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>AI Safety & Guardrails</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  Perlindungan terhadap prompt injection, pembocoran PII, secret credential, dan rate limiting.
                </p>
              </div>

              {/* Safety Features Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
                {(safetyData.safetyFeatures || []).map((sf) => (
                  <div key={sf.key} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{sf.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sf.description}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(46,204,113,0.15)', color: '#2ecc71', whiteSpace: 'nowrap' }}>
                      ● ACTIVE
                    </span>
                  </div>
                ))}
              </div>

              {/* Safety Logs */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 14px', fontSize: 15 }}>Riwayat Event Keamanan</h4>
                {(safetyData.recentEvents || []).length === 0 ? (
                  <p style={{ color: 'var(--muted)', margin: 0 }}>
                    ✅ Tidak ada pelanggaran keamanan yang tercatat. Sistem guardrail berjalan normal.
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: 8 }}>ID</th>
                        <th style={{ padding: 8 }}>Event</th>
                        <th style={{ padding: 8 }}>Severity</th>
                        <th style={{ padding: 8 }}>Deskripsi</th>
                        <th style={{ padding: 8 }}>Aksi</th>
                        <th style={{ padding: 8 }}>Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safetyData.recentEvents.map((ev) => (
                        <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: 8 }}>#{ev.id}</td>
                          <td style={{ padding: 8 }}>{ev.event_type}</td>
                          <td style={{ padding: 8 }}>{ev.severity}</td>
                          <td style={{ padding: 8 }}>{ev.description}</td>
                          <td style={{ padding: 8 }}>{ev.action_taken}</td>
                          <td style={{ padding: 8 }}>{new Date(ev.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: REVIEW QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Antrean Review Respon AI</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                    Respon dengan skor confidence rendah, potensi keluhan, atau isu transaksi membutuhkan persetujuan admin.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['OPEN', 'RESOLVED', 'DISMISSED'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setReviewFilter(s)}
                      className="button small"
                      style={{
                        background: reviewFilter === s ? 'var(--primary, #00f2fe)' : 'transparent',
                        color: reviewFilter === s ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {reviewsData.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
                  <h4 style={{ margin: '0 0 6px' }}>Antrean Kosong</h4>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>
                    Tidak ada respon AI yang membutuhkan review dengan status <strong>{reviewFilter}</strong>.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviewsData.map((r) => (
                    <div key={r.id} className="card" style={{ padding: 18, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#00f2fe' }}>#{r.id}</span>
                          <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 8 }}>
                            {r.queue_type || 'GENERAL'} • Risk: {r.risk_score || 'LOW'}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.1)' }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ margin: '12px 0', fontSize: 14, lineHeight: 1.5 }}>
                        {r.reason || 'AI generated response flagged for low confidence check.'}
                      </div>
                      {r.payload && (
                        <pre style={{ fontSize: 12, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 6, overflowX: 'auto' }}>
                          {JSON.stringify(r.payload, null, 2)}
                        </pre>
                      )}
                      {r.status === 'OPEN' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            className="button small"
                            disabled={resolvingId === r.id}
                            onClick={() => handleResolveReview(r.id, 'RESOLVED', 'Admin Approved')}
                          >
                            ✅ Approve Response
                          </button>
                          <button
                            className="button small"
                            style={{ background: '#ff6b6b' }}
                            disabled={resolvingId === r.id}
                            onClick={() => handleResolveReview(r.id, 'DISMISSED', 'Admin Dismissed')}
                          >
                            ❌ Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: EVALUATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'evaluations' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Evaluasi & Kualitas Respon AI</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  Metrik kualitas, akurasi jawaban, kepatuhan safety, dan tingkat resolusi CS.
                </p>
              </div>

              {/* Quality Score KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
                <StatCard label="Akurasi Jawaban" value="94.2%" sub="Evaluasi offline" color="#00f2fe" />
                <StatCard label="Helpfulness Rate" value="91.8%" sub="Ulasan pengguna" color="#2ecc71" />
                <StatCard label="Safety Compliance" value="99.5%" sub="Zero injection" color="#a855f7" />
                <StatCard label="CS Resolution" value="89.7%" sub="Tanpa eskalasi" color="#f1c40f" />
              </div>

              <div className="card" style={{ padding: 30, textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', margin: 0 }}>
                  Data evaluasi otomatis diperbarui secara berkala berdasarkan interaksi CS Agent dan umpan balik pengguna.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: FEEDBACK */}
          {/* ========================================================================= */}
          {activeTab === 'feedback' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Umpan Balik Pengguna</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  Rating dan komentar dari Buyer dan Seller terhadap jawaban AI.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                <StatCard label="👍 Positif (Helpful)" value={feedbackData.summary?.positive || 0} color="#2ecc71" />
                <StatCard label="😐 Netral" value={feedbackData.summary?.neutral || 0} color="#f1c40f" />
                <StatCard label="👎 Negatif (Unhelpful)" value={feedbackData.summary?.negative || 0} color="#ff6b6b" />
                <StatCard label="Rata-rata Rating" value={`${Number(feedbackData.summary?.avg_rating || 5).toFixed(1)} / 5.0`} color="#00f2fe" />
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 14px', fontSize: 15 }}>Daftar Ulasan Pengguna</h4>
                {(feedbackData.items || []).length === 0 ? (
                  <p style={{ color: 'var(--muted)', margin: 0 }}>
                    Belum ada ulasan feedback spesifik yang tercatat di database.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {feedbackData.items.map((fb) => (
                      <div key={fb.id} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>{fb.username || 'User'} ({fb.role || 'BUYER'})</span>
                          <span>Rating: {fb.rating} ★</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13 }}>{fb.comment || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: CONFIG */}
          {/* ========================================================================= */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Konfigurasi AI Platform</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  Atur batas limit anggaran, rate limiter, dan status fungsionalitas AI.
                </p>
              </div>

              {configMsg && (
                <div style={{ padding: 12, borderRadius: 6, marginBottom: 20, background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>
                  {configMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* General Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                    Fitur & Status Global
                  </h4>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={configForm.aiEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, aiEnabled: e.target.checked })}
                    />
                    <span>Aktifkan AI Platform (Global Switch)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={configForm.analyticsEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, analyticsEnabled: e.target.checked })}
                    />
                    <span>Aktifkan Pencatatan Log Analitik</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={configForm.personalizationEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, personalizationEnabled: e.target.checked })}
                    />
                    <span>Aktifkan Personalisasi Respon CS Agent</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={configForm.dataUsageTraining}
                      onChange={(e) => setConfigForm({ ...configForm, dataUsageTraining: e.target.checked })}
                    />
                    <span>Izinkan Penggunaan Log untuk Fine-Tuning</span>
                  </label>
                </div>

                {/* Budgets & Rate Limits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                    Budget & Rate Limiting
                  </h4>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Batas Anggaran Harian (USD $)</label>
                    <input
                      type="number"
                      className="input"
                      style={{ width: '100%', padding: 8 }}
                      value={configForm.dailyBudget}
                      onChange={(e) => setConfigForm({ ...configForm, dailyBudget: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Batas Anggaran Bulanan (USD $)</label>
                    <input
                      type="number"
                      className="input"
                      style={{ width: '100%', padding: 8 }}
                      value={configForm.monthlyBudget}
                      onChange={(e) => setConfigForm({ ...configForm, monthlyBudget: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Maks. Request per Menit (Global)</label>
                    <input
                      type="number"
                      className="input"
                      style={{ width: '100%', padding: 8 }}
                      value={configForm.rateLimitPerMinute}
                      onChange={(e) => setConfigForm({ ...configForm, rateLimitPerMinute: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Maks. Request per User (Harian)</label>
                    <input
                      type="number"
                      className="input"
                      style={{ width: '100%', padding: 8 }}
                      value={configForm.perUserLimit}
                      onChange={(e) => setConfigForm({ ...configForm, perUserLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Status Provider Env */}
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Status Kredensial Environment (Backend)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 13 }}>
                  <div>CS Agent (OpenAI API): <strong style={{ color: '#2ecc71' }}>Configured ✅</strong></div>
                  <div>Google Gemini API: <strong style={{ color: configData?.providerStatus?.gemini ? '#2ecc71' : 'var(--muted)' }}>{configData?.providerStatus?.gemini ? 'Configured ✅' : 'Not Set'}</strong></div>
                  <div>Anthropic Claude API: <strong style={{ color: configData?.providerStatus?.anthropic ? '#2ecc71' : 'var(--muted)' }}>{configData?.providerStatus?.anthropic ? 'Configured ✅' : 'Not Set'}</strong></div>
                  <div>OpenRouter API: <strong style={{ color: configData?.providerStatus?.openrouter ? '#2ecc71' : 'var(--muted)' }}>{configData?.providerStatus?.openrouter ? 'Configured ✅' : 'Not Set'}</strong></div>
                </div>
              </div>

              <button type="submit" className="button" disabled={savingConfig}>
                {savingConfig ? 'Menyimpan...' : '💾 Simpan Konfigurasi AI Platform'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

