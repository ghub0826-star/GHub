import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, updateTheme } from '../../../services/tenantService';

export default function ThemeBuilder() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
const [theme, setTheme] = useState({ primary_color: '#6c5ce7', secondary_color: '#00cec9', font: 'Inter', logo: '', homepage_banner: '', favicon: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listTenants({ limit: 200 }).then((r) => { const t = r.data.tenants || []; setTenants(t); if (t[0]) setTenantId(String(t[0].id)); })
      .catch(console.error);
  }, []);

  const set = (k) => (e) => setTheme({ ...theme, [k]: e.target.value });

  const handleSave = async () => {
    if (!tenantId) return setMsg('Select a tenant first');
    try { await updateTheme(tenantId, theme); setMsg('Theme saved'); } catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="Theme Builder">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div className="card" style={{ padding: 20, maxWidth: 560 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Tenant</label>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ marginBottom: 16, width: '100%' }}>
          <option value="">Select tenant</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label>Primary Color</label>
            <input type="color" value={theme.primary_color} onChange={set('primary_color')} style={{ width: '100%', height: 44 }} />
          </div>
          <div>
            <label>Secondary Color</label>
            <input type="color" value={theme.secondary_color} onChange={set('secondary_color')} style={{ width: '100%', height: 44 }} />
          </div>
<div>
            <label>Font Family</label>
            <input value={theme.font} onChange={set('font')} placeholder="Inter" />
          </div>
          <div>
            <label>Logo URL</label>
            <input value={theme.logo} onChange={set('logo')} placeholder="https://..." />
          </div>
          <div>
            <label>Banner URL</label>
            <input value={theme.homepage_banner} onChange={set('homepage_banner')} placeholder="https://..." />
          </div>
          <div>
            <label>Favicon URL</label>
            <input value={theme.favicon} onChange={set('favicon')} placeholder="https://..." />
          </div>
        </div>
        <button className="button" style={{ marginTop: 16 }} onClick={handleSave}>Save Theme</button>
      </div>
    </EnterpriseLayout>
  );
}
