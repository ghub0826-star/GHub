import React, { useEffect, useState } from 'react';
import EnterpriseLayout from '../../../components/enterprise/EnterpriseLayout';
import { fetchExchangeRates as listExchangeRates, setExchangeRate as updateExchangeRate } from '../../../services/exchangeRateService';

export default function ExchangeRates() {
  const [rates, setRates] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const r = await listExchangeRates(); setRates(r.data?.rates || r.data || []); } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleUpdate = async (currency, rate, manualOverride) => {
    try { await updateExchangeRate(currency, rate, manualOverride); setMsg('Updated ' + currency); load(); }
    catch(e){ setMsg(e.message); }
  };

  return (
    <EnterpriseLayout title="Exchange Rates">
      {msg && <div className="card" style={{ padding: 12, marginBottom: 16, color: '#ffe66d' }}>{msg}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 10 }}>Currency</th><th style={{ padding: 10 }}>Rate</th>
                <th style={{ padding: 10 }}>Manual</th><th style={{ padding: 10 }}>Updated</th><th style={{ padding: 10 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <RateRow key={r.currency} r={r} onSave={handleUpdate} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </EnterpriseLayout>
  );
}

function RateRow({ r, onSave }) {
  const [rate, setRate] = useState(r.rate);
  const [manual, setManual] = useState(!!r.manual_override);
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: 10 }}>{r.currency}</td>
      <td style={{ padding: 10 }}>
        <input type="number" step="any" value={rate} onChange={(e) => setRate(e.target.value)} style={{ width: 120 }} />
      </td>
      <td style={{ padding: 10 }}>
        <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
      </td>
      <td style={{ padding: 10 }}>{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
      <td style={{ padding: 10 }}>
        <button className="button small" onClick={() => onSave(r.currency, Number(rate), manual)}>Save</button>
      </td>
    </tr>
  );
}
