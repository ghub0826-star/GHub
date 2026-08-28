import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { runBackup, listBackups, restoreBackup } from '../../../services/tenantService';

export default function Backup() {
  const [backups, setBackups] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const r = await listBackups(); setBackups(r.data?.backups || r.data || []); } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleRun = async () => {
    try { const r = await runBackup(); setMsg(r.data?.message || 'Backup started'); setTimeout(load, 1500); } catch(e){ setMsg(e.message); }
  };
  const handleRestore = async (filename) => {
    if (!confirm('Restore from ' + filename + '? This may overwrite data.')) return;
    try { const r = await restoreBackup(filename); setMsg(r.data?.message || 'Restore completed'); } catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="Backup & Restore">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      <div style={{ marginBottom: 16 }}>
        <button className="button" onClick={handleRun}>
          <i className="fa-solid fa-database" />&nbsp;Run Backup Now
        </button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 10 }}>Filename</th><th style={{ padding: 10 }}>Type</th>
                <th style={{ padding: 10 }}>Created</th><th style={{ padding: 10 }}>Size</th><th style={{ padding: 10 }}>Action</th>
              </tr>
            </thead>
            <tbody>
{backups.map((b) => (
                <tr key={b.file || b.filename || b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 10 }}>{b.file || b.filename || b.id}</td>
                  <td style={{ padding: 10 }}>{(b.file || b.filename || '').includes('db-') ? 'Database' : (b.file || b.filename || '').includes('config-') ? 'Config' : '-'}</td>
                  <td style={{ padding: 10 }}>{b.modified ? new Date(b.modified).toLocaleString() : (b.created_at ? new Date(b.created_at).toLocaleString() : '-')}</td>
                  <td style={{ padding: 10 }}>{b.size ? (b.size/1024).toFixed(1) + ' KB' : '-'}</td>
                  <td style={{ padding: 10 }}>
                    <button className="button small" onClick={() => handleRestore(b.file || b.filename)}>Restore</button>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && <tr><td colSpan={5} style={{ padding: 16, color: 'var(--muted)' }}>No backups yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </EnterpriseLayout>
  );
}
