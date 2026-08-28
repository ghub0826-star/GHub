import React, { useEffect, useState } from 'react';
import * as notificationService from '../services/notificationService';

const PREF_KEYS = {
  in_app_enabled: 'Notifikasi dalam aplikasi',
  email_enabled: 'Notifikasi email',
  whatsapp_enabled: 'Notifikasi WhatsApp',
  order_enabled: 'Update pesanan',
  payment_enabled: 'Update pembayaran',
  chat_enabled: 'Pesan chat',
  dispute_enabled: 'Sengketa & refund',
  promo_enabled: 'Promo & penawaran',
  system_enabled: 'Pemberitahuan sistem',
};

export default function NotificationSettings(){
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    notificationService.getPreferences()
      .then((res) => {
        if (res && res.preferences) setPrefs(res.preferences);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await notificationService.updatePreferences(prefs);
      setSaved(true);
    } catch (e) { /* ignore */ } finally {
      setSaving(false);
    }
  };

  return (
    <div className='container'>
      <h1>Pengaturan Notifikasi</h1>
      <div className='card' style={{ maxWidth: 560 }}>
        {loading ? (
          <div className='muted' style={{ padding: 20 }}>Memuat...</div>
        ) : (
          <>
            {Object.entries(PREF_KEYS).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <strong>{label}</strong>
                </div>
                <label className='switch' style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                  <input
                    type='checkbox'
                    checked={!!prefs[key]}
                    onChange={(e) => toggle(key, e.target.checked ? 1 : 0)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24,
                      background: prefs[key] ? 'var(--accent)' : '#333', transition: '0.3s',
                    }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: prefs[key] ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className='button' onClick={save} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              {saved && <span style={{ color: 'var(--accent)' }}>✓ Tersimpan</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
