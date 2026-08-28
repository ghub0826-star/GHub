import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, getPlans, updateSubscription } from '../../../services/tenantService';

export default function Subscription() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [plan, setPlan] = useState('STARTER');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listTenants({ limit: 200 }).then((r) => { const t = r.data.tenants || []; setTenants(t); if (t[0]) setTenantId(String(t[0].id)); }).catch(console.error);
    getPlans().then((r) => setPlans(r.data?.plans || r.data || [])).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!tenantId) return setMsg('Select tenant');
    try { await updateSubscription(tenantId, { plan }); setMsg('Subscription updated'); } catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="Subscription Management">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div className="card" style={{ padding: 20, maxWidth: 520 }}>
        <label>Tenant</label>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ marginBottom: 12, width: '100%' }}>
          <option value="">Select</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <label>Plan</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ marginBottom: 12, width: '100%' }}>
          {['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {plans.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <strong>Available plans:</strong>
            <ul>
              {plans.map((p) => <li key={p.code}>{p.name} — {p.price}</li>)}
            </ul>
          </div>
        )}
        <button className="button" onClick={handleSave}>Update Subscription</button>
      </div>
    </EnterpriseLayout>
  );
}
