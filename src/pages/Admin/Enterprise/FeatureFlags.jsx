import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, setFeatureFlag } from '../../../services/tenantService';

const DEFAULT_FEATURES = ['chat', 'wallet', 'multi_currency', 'disputes', 'referrals', 'loyalty', 'api_access', 'cms'];

export default function FeatureFlags() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [flags, setFlags] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listTenants({ limit: 200 }).then((r) => {
      const t = r.data.tenants || [];
      setTenants(t);
      if (t[0]) {
        setTenantId(String(t[0].id));
        const f = {};
        DEFAULT_FEATURES.forEach((feat) => (f[feat] = false));
        if (t[0].feature_flags) Object.assign(f, t[0].feature_flags);
        setFlags(f);
      }
    }).catch(console.error);
  }, []);

  const toggle = async (feat) => {
    const next = { ...flags, [feat]: !flags[feat] };
    setFlags(next);
    if (!tenantId) return setMsg('Select tenant');
    try { await setFeatureFlag(tenantId, feat, next[feat], {}); setMsg('Flag ' + feat + ' = ' + next[feat]); } catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="Feature Flags">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div className="card" style={{ padding: 20, maxWidth: 520, marginBottom: 16 }}>
        <label>Tenant</label>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ width: '100%' }}>
          <option value="">Select</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {DEFAULT_FEATURES.map((feat) => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: 600 }}>{feat}</span>
              <label className="switch">
                <input type="checkbox" checked={!!flags[feat]} onChange={() => toggle(feat)} />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </EnterpriseLayout>
  );
}
