import React, { useEffect, useState, useCallback } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { getMonitoring } from '../../../services/tenantService';

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

function formatUptime(seconds) {
  if (!seconds || isNaN(seconds)) return '-';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

export default function Monitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      const r = await getMonitoring();
      setData(r.data?.metrics || r.data || {});
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || 'Gagal memuat metrik monitoring');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cpuPercent = typeof data?.cpu === 'object' ? (data.cpu.usagePercent ?? 0) : (typeof data?.cpu === 'number' ? data.cpu : 0);
  const cpuCores = typeof data?.cpu === 'object' ? (data.cpu.cores ?? 1) : 1;

  const memPercent = typeof data?.memory === 'object' ? (data.memory.usagePercent ?? 0) : 0;
  const memUsed = typeof data?.memory === 'object' ? (data.memory.used ?? 0) : 0;
  const memTotal = typeof data?.memory === 'object' ? (data.memory.total ?? 0) : 0;

  const stack = data?.stack || {};
  const apiStatus = data?.api?.ok ? 'UP' : (stack.api || 'UP');
  const dbStatus = data?.api?.database || stack.database || 'UP';
  const queueStatus = stack.queue || 'UP';
  const cacheStatus = stack.cache || 'UP';

  return (
    <EnterpriseLayout title="Enterprise Monitoring & Infrastructure">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#feca57', border: '1px solid #feca57' }}>{msg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>System Health & Metrics</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            Real-time observability untuk stack layanan, beban server, dan memory.
          </p>
        </div>
        <button className="button small" onClick={load} disabled={loading}>
          {loading ? 'Memuat...' : '↻ Refresh Status'}
        </button>
      </div>

      {loading && !data ? (
        <div className="card" style={{ padding: 30, textAlign: 'center' }}>
          <p>Memuat metrik infrastruktur...</p>
        </div>
      ) : (
        <>
          {/* Main Resource Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* CPU Usage */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>CPU Load</span>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>
                  {cpuCores} Cores
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 8, color: '#00f2fe' }}>
                {cpuPercent}%
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(cpuPercent, 100)}%`, height: '100%', background: '#00f2fe', borderRadius: 3 }} />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Memory RAM</span>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: 'rgba(79,172,254,0.1)', color: '#4facfe' }}>
                  {formatBytes(memUsed)} / {formatBytes(memTotal)}
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 8, color: '#4facfe' }}>
                {memPercent}%
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(memPercent, 100)}%`, height: '100%', background: '#4facfe', borderRadius: 3 }} />
              </div>
            </div>

            {/* Uptime */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Server Uptime</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 8, color: '#2ecc71' }}>
                {formatUptime(data?.uptimeSeconds)}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                Status: <strong>Online</strong>
              </div>
            </div>

            {/* Host Platform */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Host Info</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {data?.hostname || 'Localhost'}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                {data?.platform || 'node'} ({data?.arch || 'x64'})
              </div>
            </div>
          </div>

          {/* Stack Status Grid */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Services & Daemon Stack</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { name: 'API Server', status: String(apiStatus).toUpperCase() },
                { name: 'PostgreSQL Database', status: String(dbStatus).toUpperCase() },
                { name: 'Queue Worker', status: String(queueStatus).toUpperCase() },
                { name: 'Cache Layer', status: String(cacheStatus).toUpperCase() },
                { name: 'WebSocket Server', status: String(stack.socket || 'UP').toUpperCase() },
                { name: 'Background Worker', status: String(stack.worker || 'UP').toUpperCase() },
              ].map((svc) => (
                <div key={svc.name} style={{ padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{svc.name}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: svc.status.includes('UP') || svc.status.includes('CONNECTED') ? 'rgba(46,204,113,0.15)' : 'rgba(241,196,15,0.15)',
                    color: svc.status.includes('UP') || svc.status.includes('CONNECTED') ? '#2ecc71' : '#f1c40f'
                  }}>
                    ● {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          {data?.timestamp && (
            <div style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 12 }}>
              Last snapshot: {new Date(data.timestamp).toLocaleString()}
            </div>
          )}
        </>
      )}
    </EnterpriseLayout>
  );
}
