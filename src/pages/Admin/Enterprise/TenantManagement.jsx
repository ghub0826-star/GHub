import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, createTenant, updateTenant, suspendTenant, activateTenant, deleteTenant, cloneTenant, backupTenant, restoreTenant } from '../../../services/tenantService';

const emptyForm = { name: '', slug: '', domain: '', default_language: 'id', default_currency: 'IDR', region: 'ap-southeast-1', email: '' };

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const r = await listTenants({ limit: 200 }); setTenants(r.data.tenants || []); } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const r = await createTenant(form);
      setMsg(r.data.success ? 'Tenant created' : r.data.message);
      if (r.data.success) { setForm(emptyForm); load(); }
    } catch (e2) { setMsg('Error: ' + e2.message); }
  };

  const act = async (fn, id) => { try { await fn(id); load(); } catch(e){ setMsg(e.message); } };

  const handleRestore = async (id) => {
    const backup = prompt('Paste backup JSON object ({"tenant":{...}})');
    if (!backup) return;
    try { await restoreTenant(id, JSON.parse(backup)); setMsg('Restored'); load(); } catch(e){ setMsg('Error: '+e.message); }
  };

  return (
    <EnterpriseLayout title="Tenant Management">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}

      <form onSubmit={handleCreate} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <input placeholder="Name" value={form.name} onChange={set('name')} required />
        <input placeholder="Slug" value={form.slug} onChange={set('slug')} required />
        <input placeholder="Domain (optional)" value={form.domain} onChange={set('domain')} />
        <select value={form.default_language} onChange={set('default_language')}>
          <option value="id">id</option><option value="en">en</option><option value="ms">ms</option>
          <option value="th">th</option><option value="vi">vi</option><option value="ja">ja</option><option value="zh">zh</option>
        </select>
        <select value={form.default_currency} onChange={set('default_currency')}>
          <option value="IDR">IDR</option><option value="USD">USD</option><option value="SGD">SGD</option>
          <option value="MYR">MYR</option><option value="THB">THB</option><option value="JPY">JPY</option><option value="EUR">EUR</option>
        </select>
        <input placeholder="Region" value={form.region} onChange={set('region')} />
        <input placeholder="Email" value={form.email} onChange={set('email')} />
        <button className="button" type="submit">Create Tenant</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 8 }}>ID</th><th style={{ padding: 8 }}>Name</th><th style={{ padding: 8 }}>Slug</th>
                <th style={{ padding: 8 }}>Lang</th><th style={{ padding: 8 }}>Cur</th><th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 8 }}>{t.id}</td>
                  <td style={{ padding: 8 }}>{t.name}</td>
                  <td style={{ padding: 8 }}>{t.slug}</td>
                  <td style={{ padding: 8 }}>{t.default_language}</td>
                  <td style={{ padding: 8 }}>{t.default_currency}</td>
                  <td style={{ padding: 8 }}>{t.status}</td>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {t.status === 'ACTIVE'
                        ? <button className="button small" onClick={() => act(suspendTenant, t.id)}>Suspend</button>
                        : <button className="button small" onClick={() => act(activateTenant, t.id)}>Activate</button>}
                      <button className="button small" onClick={() => act(cloneTenant, t.id)}>Clone</button>
                      <button className="button small" onClick={() => act(backupTenant, t.id)}>Backup</button>
                      <button className="button small" onClick={() => handleRestore(t.id)}>Restore</button>
                      <button className="button small" style={{ background: '#d63031' }} onClick={async () => { if (confirm('Delete tenant?')) await act(deleteTenant, t.id); }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </EnterpriseLayout>
  );
}
