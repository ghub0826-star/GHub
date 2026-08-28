import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, listInvoices } from '../../../services/tenantService';

export default function Billing() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listTenants({ limit: 200 }).then((r) => { const t = r.data.tenants || []; setTenants(t); if (t[0]) setTenantId(String(t[0].id)); }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    listInvoices(tenantId).then((r) => setInvoices(r.data?.invoices || r.data || [])).catch((e) => setMsg(e.message));
  }, [tenantId]);

  return (
    <EnterpriseLayout title="Billing">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div className="card" style={{ padding: 20, maxWidth: 520, marginBottom: 16 }}>
        <label>Tenant</label>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ width: '100%' }}>
          <option value="">Select</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: 10 }}>Invoice #</th><th style={{ padding: 10 }}>Amount</th>
              <th style={{ padding: 10 }}>Status</th><th style={{ padding: 10 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
<td style={{ padding: 10 }}>{inv.invoice_no || inv.invoice_number || inv.id}</td>
                <td style={{ padding: 10 }}>{inv.amount}</td>
                <td style={{ padding: 10 }}>{inv.status}</td>
                <td style={{ padding: 10 }}>{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={4} style={{ padding: 16, color: 'var(--muted)' }}>No invoices</td></tr>}
          </tbody>
        </table>
      </div>
    </EnterpriseLayout>
  );
}
