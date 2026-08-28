import React, { useEffect, useState, useCallback } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import api from '../../services/api';
import formatCurrency from '../../utils/formatCurrency';

const TX_LABELS = {
  held:                { label: 'Ditahan',            color: '#f59e0b' },
  released:            { label: 'Dicairkan',          color: '#34d399' },
  withdrawal_request:  { label: 'Penarikan',          color: '#38bdf8' },
  topup:               { label: 'Top Up',             color: '#818cf8' },
  refund:              { label: 'Refund',             color: '#10b981' },
  adjustment:          { label: 'Penyesuaian',        color: '#a78bfa' },
};

const TOPUP_METHODS = ['QRIS', 'VIRTUAL_ACCOUNT', 'E_WALLET', 'BANK_TRANSFER'];

export default function BuyerWallet() {
  const [wallet,       setWallet]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals,  setWithdrawals]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('transactions'); // transactions | withdraw | topup
  const [msg,          setMsg]          = useState('');
  const [msgType,      setMsgType]      = useState('success');

  // Topup form
  const [topupAmount, setTopupAmount]   = useState('');
  const [topupMethod, setTopupMethod]   = useState('QRIS');
  const [topupPending, setTopupPending] = useState(false);
  const [snapToken,    setSnapToken]    = useState(null);

  // Withdraw form
  const [wdAmount,  setWdAmount]  = useState('');
  const [bankInfo,  setBankInfo]  = useState({ bank_name: '', account_number: '', account_name: '' });
  const [wdPending, setWdPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [balRes, txRes, wdRes] = await Promise.allSettled([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions?limit=20'),
        api.get('/wallet/withdrawals'),
      ]);
      if (balRes.status === 'fulfilled')
        setWallet(balRes.value?.data?.data || balRes.value?.data || null);
      if (txRes.status === 'fulfilled')
        setTransactions(txRes.value?.data?.data || []);
      if (wdRes.status === 'fulfilled')
        setWithdrawals(wdRes.value?.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 5000);
  };

  // Topup handler — creates Midtrans Snap transaction
  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || Number(topupAmount) < 10000) {
      showMsg('Minimal top up Rp 10.000', 'error'); return;
    }
    setTopupPending(true);
    try {
      const res = await api.post('/wallet/topup', { amount: Number(topupAmount), paymentMethod: topupMethod });
      const data = res?.data?.data || res?.data;
      if (data?.snap_token) {
        setSnapToken(data.snap_token);
        // Launch Midtrans Snap
        if (window.snap) {
          window.snap.pay(data.snap_token, {
            onSuccess: () => { showMsg('Top up berhasil!', 'success'); load(); setSnapToken(null); setTopupAmount(''); },
            onPending: () => { showMsg('Pembayaran tertunda. Selesaikan di aplikasi/bank Anda.', 'success'); },
            onError:   () => { showMsg('Pembayaran gagal. Silakan coba lagi.', 'error'); setSnapToken(null); },
            onClose:   () => { setSnapToken(null); },
          });
        } else {
          showMsg('Midtrans belum dikonfigurasi. Hubungi admin.', 'error');
        }
      } else {
        showMsg(data?.message || 'Permintaan top up dikirim.', 'success');
        setTopupAmount('');
      }
    } catch (err) {
      showMsg(err?.response?.data?.message || 'Gagal membuat permintaan top up.', 'error');
    } finally {
      setTopupPending(false);
    }
  };

  // Withdraw handler
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!wdAmount || Number(wdAmount) < 10000) {
      showMsg('Minimal penarikan Rp 10.000', 'error'); return;
    }
    if (!bankInfo.bank_name || !bankInfo.account_number || !bankInfo.account_name) {
      showMsg('Lengkapi data rekening bank', 'error'); return;
    }
    setWdPending(true);
    try {
      await api.post('/wallet/withdraw', { amount: Number(wdAmount), bank_info: bankInfo });
      showMsg('Permintaan penarikan berhasil dikirim. Diproses dalam 1-3 hari kerja.', 'success');
      setWdAmount('');
      setBankInfo({ bank_name: '', account_number: '', account_name: '' });
      load();
    } catch (err) {
      showMsg(err?.response?.data?.message || 'Gagal memproses penarikan.', 'error');
    } finally {
      setWdPending(false);
    }
  };

  return (
    <BuyerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(99,102,241,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#818cf8', fontSize: '1.1rem',
          }}>
            <i className="fa-solid fa-wallet" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Dompet Saya</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Kelola saldo dan transaksi GHub Anda</p>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
            background: msgType === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: msgType === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <i className={`fa-solid ${msgType === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            {msg}
          </div>
        )}

        {/* Balance cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {[
            { label: 'Saldo Tersedia', value: wallet?.available_balance ?? 0, color: '#818cf8', bg: 'rgba(99,102,241,0.1)',   icon: 'fa-solid fa-circle-check' },
            { label: 'Saldo Ditahan',  value: wallet?.held_balance      ?? 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   icon: 'fa-solid fa-clock' },
            { label: 'Saldo Proses',   value: wallet?.pending_balance   ?? 0, color: '#34d399', bg: 'rgba(52,211,153,0.1)',   icon: 'fa-solid fa-rotate' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 20,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: c.bg, color: c.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                }}>
                  <i className={c.icon} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>{c.label}</span>
              </div>
              {loading ? (
                <div style={{ height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
              ) : (
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
                  {formatCurrency(c.value)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action tabs */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {/* Tab headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { key: 'transactions', label: 'Riwayat', icon: 'fa-solid fa-list' },
              { key: 'topup',        label: 'Top Up',  icon: 'fa-solid fa-plus-circle' },
              { key: 'withdraw',     label: 'Tarik Dana', icon: 'fa-solid fa-arrow-right-from-bracket' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
                  background: activeTab === t.key ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: activeTab === t.key ? '#818cf8' : '#64748b',
                  fontWeight: activeTab === t.key ? 700 : 500,
                  fontSize: '0.88rem', borderBottom: activeTab === t.key ? '2px solid #6366f1' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <i className={t.icon} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div style={{ padding: 20 }}>

            {/* Transactions tab */}
            {activeTab === 'transactions' && (
              loading ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>Memuat riwayat...</div>
              ) : transactions.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '32px 0' }}>
                  <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: 10, opacity: 0.4 }} />
                  Belum ada riwayat transaksi.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {transactions.map((tx, i) => {
                    const info = TX_LABELS[tx.type] || { label: tx.type || 'Transaksi', color: '#94a3b8' };
                    return (
                      <div key={tx.id || i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 0', gap: 12,
                        borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: `${info.color}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className="fa-solid fa-arrow-right-arrow-left" style={{ color: info.color, fontSize: '0.8rem' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: info.color, fontSize: '0.88rem' }}>{info.label}</div>
                            {tx.description && (
                              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {tx.description}
                              </div>
                            )}
                            <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: 1 }}>
                              {tx.created_at ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', flexShrink: 0, fontSize: '0.95rem' }}>
                          {formatCurrency(tx.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Top Up tab */}
            {activeTab === 'topup' && (
              <form onSubmit={handleTopup} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#94a3b8', fontSize: '0.88rem' }}>
                    Nominal Top Up (min. Rp 10.000)
                  </label>
                  <input
                    type="number" min="10000" value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    placeholder="Contoh: 100000"
                    style={{ width: '100%' }}
                    required
                  />
                  {/* Quick amount buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {[50000, 100000, 200000, 500000].map(v => (
                      <button key={v} type="button" onClick={() => setTopupAmount(String(v))}
                        className="button small cta-outline" style={{ fontSize: '0.8rem' }}>
                        {formatCurrency(v)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#94a3b8', fontSize: '0.88rem' }}>
                    Metode Pembayaran
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {TOPUP_METHODS.map(m => (
                      <label key={m} style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${topupMethod === m ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                        background: topupMethod === m ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all 0.15s',
                      }}>
                        <input type="radio" value={m} checked={topupMethod === m} onChange={() => setTopupMethod(m)} style={{ display: 'none' }} />
                        <i className={
                          m === 'QRIS' ? 'fa-solid fa-qrcode' :
                          m === 'VIRTUAL_ACCOUNT' ? 'fa-solid fa-building-columns' :
                          m === 'E_WALLET' ? 'fa-solid fa-mobile-screen-button' :
                          'fa-solid fa-money-bill-transfer'
                        } style={{ color: topupMethod === m ? '#818cf8' : '#64748b', fontSize: '1rem' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: topupMethod === m ? '#fff' : '#94a3b8' }}>
                          {m === 'QRIS' ? 'QRIS' : m === 'VIRTUAL_ACCOUNT' ? 'Virtual Account' : m === 'E_WALLET' ? 'E-Wallet' : 'Transfer Bank'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="button" disabled={topupPending}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <i className={`fa-solid ${topupPending ? 'fa-circle-notch fa-spin' : 'fa-plus-circle'}`} />
                  {topupPending ? 'Memproses...' : 'Lanjutkan Top Up'}
                </button>
              </form>
            )}

            {/* Withdraw tab */}
            {activeTab === 'withdraw' && (
              <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.88rem', color: '#94a3b8' }}>
                  Saldo tersedia: <strong style={{ color: '#818cf8' }}>{formatCurrency(wallet?.available_balance ?? 0)}</strong>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#94a3b8', fontSize: '0.88rem' }}>
                    Nominal Penarikan (min. Rp 10.000)
                  </label>
                  <input type="number" min="10000" value={wdAmount} onChange={e => setWdAmount(e.target.value)}
                    placeholder="Contoh: 500000" style={{ width: '100%' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#94a3b8', fontSize: '0.88rem' }}>Nama Bank</label>
                    <input value={bankInfo.bank_name} onChange={e => setBankInfo(b => ({ ...b, bank_name: e.target.value }))}
                      placeholder="BCA, Mandiri, BRI..." style={{ width: '100%' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#94a3b8', fontSize: '0.88rem' }}>No. Rekening</label>
                    <input value={bankInfo.account_number} onChange={e => setBankInfo(b => ({ ...b, account_number: e.target.value }))}
                      placeholder="1234567890" style={{ width: '100%' }} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#94a3b8', fontSize: '0.88rem' }}>Nama Pemilik Rekening</label>
                  <input value={bankInfo.account_name} onChange={e => setBankInfo(b => ({ ...b, account_name: e.target.value }))}
                    placeholder="Sesuai buku tabungan" style={{ width: '100%' }} required />
                </div>
                <button type="submit" className="button" disabled={wdPending}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <i className={`fa-solid ${wdPending ? 'fa-circle-notch fa-spin' : 'fa-arrow-right-from-bracket'}`} />
                  {wdPending ? 'Memproses...' : 'Kirim Permintaan Penarikan'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Withdrawal history */}
        {activeTab === 'withdraw' && withdrawals.length > 0 && (
          <div style={{
            background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: 20,
          }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
              Riwayat Penarikan
            </h3>
            {withdrawals.map((w, i) => (
              <div key={w.id || i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderBottom: i < withdrawals.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{formatCurrency(w.amount)}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2 }}>
                    {w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, alignSelf: 'center',
                  background: w.status === 'completed' ? 'rgba(16,185,129,0.12)' : w.status === 'rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                  color:      w.status === 'completed' ? '#10b981'              : w.status === 'rejected' ? '#ef4444'              : '#f59e0b',
                }}>
                  {w.status === 'completed' ? 'Selesai' : w.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </BuyerLayout>
  );
}
