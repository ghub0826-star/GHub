import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, getCms, saveCmsSection } from '../../../services/tenantService';

export default function CMSBuilder() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [section, setSection] = useState('hero');
  const [content, setContent] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listTenants({ limit: 200 }).then((r) => { const t = r.data.tenants || []; setTenants(t); if (t[0]) setTenantId(String(t[0].id)); })
      .catch(console.error);
  }, []);

  const loadCms = async () => {
    if (!tenantId) return;
try { const r = await getCms(tenantId); setContent(JSON.stringify(r.data?.content || {}, null, 2)); } catch(e){ console.error(e); }
  };
  useEffect(() => { loadCms(); }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId) return setMsg('Select tenant');
    try {
      let data;
      try { data = JSON.parse(content); } catch { return setMsg('Invalid JSON content'); }
      await saveCmsSection(tenantId, section, data);
      setMsg('CMS saved');
    } catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="CMS Builder">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div className="card" style={{ padding: 20, maxWidth: 640 }}>
        <label>Tenant</label>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ marginBottom: 12, width: '100%' }}>
          <option value="">Select</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <label>Section</label>
        <select value={section} onChange={(e) => setSection(e.target.value)} style={{ marginBottom: 12, width: '100%' }}>
          {['hero', 'featured', 'footer', 'about', 'promo'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Content (JSON)</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} style={{ width: '100%', fontFamily: 'monospace' }} />
        <button className="button" style={{ marginTop: 16 }} onClick={handleSave}>Save Section</button>
      </div>
    </EnterpriseLayout>
  );
}
