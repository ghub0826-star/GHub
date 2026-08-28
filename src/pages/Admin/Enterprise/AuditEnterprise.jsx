import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { getAudit } from '../../../services/tenantService';

export default function AuditEnterprise() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
getAudit({ limit: 200 })
      .then((r) => setLogs(r.data?.audit || r.data || []))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <EnterpriseLayout title="Enterprise Audit Log">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#feca57' }}>{msg}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 8 }}>ID</th><th style={{ padding: 8 }}>Action</th>
                <th style={{ padding: 8 }}>Actor</th><th style={{ padding: 8 }}>Resource</th>
                <th style={{ padding: 8 }}>Tenant</th><th style={{ padding: 8 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 8 }}>{l.id}</td>
<td style={{ padding: 8 }}>{l.action}</td>
                  <td style={{ padding: 8 }}>{l.actor_id || l.actor || '-'}</td>
                  <td style={{ padding: 8 }}>{l.resource_type || l.resource || '-'}</td>
                  <td style={{ padding: 8 }}>{l.resource_id || '-'}</td>
                  <td style={{ padding: 8 }}>{l.tenant_id || '-'}</td>
                  <td style={{ padding: 8 }}>{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} style={{ padding: 16, color: 'var(--muted)' }}>No audit logs</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </EnterpriseLayout>
  );
}
