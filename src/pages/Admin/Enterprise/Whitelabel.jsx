import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, updateWhiteLabel } from '../../../services/tenantService';

export default function Whitelabel() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [settings, setSettings] = useState({ brand_name: '', support_email: '', legal_url: '', logo_url: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listTenants({ limit: 200 }).then((r) => { const t = r.data.tenants || []; setTenants(t); if (t[0]) setTenantId(String(t[0].id)); }).catch(console.error);
  }, []);

  const set = (k) => (e) => setSettings({ ...settings, [k]: e.target.value });

  const handleSave = async () => {
    if (!tenantId) return setMsg('Select tenant');
    try { await updateWhiteLabel(tenantId, settings); setMsg('White label saved'); } catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="White Label">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div className="card" style={{ padding: 20, maxWidth: 560 }}>
        <label>Tenant</label>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ marginBottom: 16, width: '100%' }}>
          <option value="">Select</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['brand_name', 'Brand Name'],
            ['support_email', 'Support Email'],
            ['legal_url', 'Legal URL'],
            ['logo_url', 'Logo URL'],
          ].map(([k, label]) => (
            <div key={k}>
              <label>{label}</label>
              <input value={settings[k]} onChange={set(k)} />
            </div>
          ))}
        </div>
        <button className="button" style={{ marginTop: 16 }} onClick={handleSave}>Save White Label</button>
      </div>
    </EnterpriseLayout>
  );
}
