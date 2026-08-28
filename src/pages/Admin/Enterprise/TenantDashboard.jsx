import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { listTenants, getTenantDashboard } from '../../../services/tenantService';

export default function TenantDashboard() {
  const [tenants, setTenants] = useState([]);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await listTenants({ limit: 50 });
        setTenants(res.data.tenants || []);
        if ((res.data.tenants || [])[0]) {
          const d = await getTenantDashboard(res.data.tenants[0].id);
          setDash(d.data.stats || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <EnterpriseLayout title="Enterprise Dashboard">
      {loading ? <p>Loading...</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Revenue', value: dash ? `Rp ${Number(dash.revenue||0).toLocaleString()}` : '-', icon: 'fa-coins' },
              { label: 'Buyers', value: dash ? dash.buyers : '-', icon: 'fa-user' },
              { label: 'Sellers', value: dash ? dash.sellers : '-', icon: 'fa-store' },
              { label: 'Orders', value: dash ? dash.orders : '-', icon: 'fa-receipt' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: 20 }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: '1.4rem', color: 'var(--primary)' }} />
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8 }}>{s.value}</div>
                <div style={{ color: 'var(--muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>Tenants ({tenants.length})</h3>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: 10 }}>ID</th>
                  <th style={{ padding: 10 }}>Name</th>
                  <th style={{ padding: 10 }}>Slug</th>
                  <th style={{ padding: 10 }}>Domain</th>
                  <th style={{ padding: 10 }}>Region</th>
                  <th style={{ padding: 10 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: 10 }}>{t.id}</td>
                    <td style={{ padding: 10 }}>{t.name}</td>
                    <td style={{ padding: 10 }}>{t.slug}</td>
                    <td style={{ padding: 10 }}>{t.domain || '-'}</td>
                    <td style={{ padding: 10 }}>{t.region}</td>
                    <td style={{ padding: 10 }}>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </EnterpriseLayout>
  );
}
