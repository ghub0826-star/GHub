import React, { useEffect, useState, useCallback } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import * as fulfillmentService from '../../services/orderFulfillmentService';
import api from '../../services/api';
import formatCurrency from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  SALE_HELD:      { label: 'Penjualan Ditahan', color: '#f59e0b' },
  SALE_RELEASED:  { label: 'Penjualan Cair',    color: '#34d399' },
  PLATFORM_FEE:   { label: 'Biaya Platform',    color: '#ef4444' },
  REFUND_REVERSAL:{ label: 'Reversal Refund',   color: '#fb923c' },
  ADJUSTMENT:     { label: 'Penyesuaian',       color: '#818cf8' },
  WITHDRAWAL:     { label: 'Penarikan',         color: '#38bdf8' },
};

export default function SellerBalance() {
  const [wallet,   setWallet]   = useState(null);
  const [ledger,   setLedger]   = useState([]);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount,   setAmount]   = useState('');
  const [bankInfo, setBankInfo] = useState({ bank_name: '', account_number: '', account_name: '' });
  const [msg,      setMsg]      = useState('');
  const [msgType,  setMsgType]  = useState('success');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      fulfillmentService.getMyWallet(),
      fulfillmentService.getMyLedger(),
      api.get('/seller/kyc/status').catch(() => null),
    ]).then(([walletRes, ledgerRes, kycRes]) => {
      if (walletRes.status === 'fulfilled')
        setWallet(walletRes.value?.data?.wallet || walletRes.value?.data || null);
      if (ledgerRes.status === 'fulfilled')
        setLedger(Array.isArray(ledgerRes.value?.data?.ledger)
          ? ledgerRes.value.data.ledger
          : Array.isArray(ledgerRes.value?.data) ? ledgerRes.value.data : []);
      if (kycRes.status === 'fulfilled' && kycRes.value)
        setKycStatus(kycRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const isKycVerified = kycStatus?.kyc_status === 'VERIFIED';

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 10000) {
      setMsgType('error'); setMsg('Minimal penarikan Rp 10.000'); return;
    }
    if (!bankInfo.bank_name || !bankInfo.account_number || !bankInfo.account_name) {
      setMsgType('error'); setMsg('Lengkapi data rekening bank terlebih dahulu'); return;
    }
    setSubmitting(true); setMsg('');
    try {
      await api.post('/wallet/withdraw', { amount: Number(amount), bank_info: bankInfo });
      setMsgType('success');
      setMsg('Permintaan penarikan berhasil dikirim. Admin akan memproses dalam 1-3 hari kerja.');
      setAmount('');
      setBankInfo({ bank_name: '', account_number: '', account_name: '' });
      setShowForm(false);
      load(); // refresh saldo
    } catch (err) {
      setMsgType('error');
      setMsg(err?.response?.data?.message || 'Gagal melakukan penarikan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(52,211,153,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#34d399', fontSize: '1.1rem',
            }}>
              <i className="fa-solid fa-wallet" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Saldo & Tarik Dana</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Kelola saldo dan riwayat transaksi toko Anda</p>
            </div>
          </div>
          <Link to="/seller/earnings" className="button small cta-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-chart-line" />
            <span>Lihat Pendapatan</span>
          </Link>
        </div>

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

        {/* KYC Banner */}
        {!loading && !isKycVerified && (
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            <i className="fa-solid fa-id-card" style={{ color: '#f59e0b', fontSize: '1.3rem' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#fbbf24' }}>Verifikasi Identitas Diperlukan</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 2 }}>
                Upload KTP dan selfie untuk mengaktifkan fitur penarikan dana.
              </div>
            </div>
            <Link to="/seller/verification" className="button small" style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }}>
              Verifikasi Sekarang
            </Link>
          </div>
        )}

        {/* Balance cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--surface)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.06)', height: 100,
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {[
              { label: 'Saldo Tersedia', value: wallet?.available_balance || 0, color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: 'fa-solid fa-circle-check' },
              { label: 'Saldo Ditahan',  value: wallet?.held_balance      || 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: 'fa-solid fa-clock' },
              { label: 'Saldo Proses',   value: wallet?.pending_balance   || 0, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', icon: 'fa-solid fa-rotate' },
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}>
                    <i className={c.icon} />
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>{c.label}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                  {formatCurrency(c.value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Withdraw button + form */}
        {!loading && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? 20 : 0 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Tarik Dana</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 3 }}>
                  Saldo tersedia: <span style={{ color: '#34d399', fontWeight: 700 }}>{formatCurrency(wallet?.available_balance || 0)}</span>
                </div>
              </div>
              <button
                className="button"
                onClick={() => setShowForm(f => !f)}
                disabled={!isKycVerified}
                title={!isKycVerified ? 'Verifikasi identitas diperlukan' : ''}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-arrow-right-from-bracket'}`} />
                {showForm ? 'Batal' : 'Tarik Dana'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', color: '#94a3b8', fontWeight: 600 }}>
                    Nominal (min. Rp 10.000)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Contoh: 500000"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', color: '#94a3b8', fontWeight: 600 }}>Nama Bank</label>
                    <input
                      value={bankInfo.bank_name}
                      onChange={e => setBankInfo(b => ({ ...b, bank_name: e.target.value }))}
                      placeholder="BCA, Mandiri, BRI..."
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', color: '#94a3b8', fontWeight: 600 }}>No. Rekening</label>
                    <input
                      value={bankInfo.account_number}
                      onChange={e => setBankInfo(b => ({ ...b, account_number: e.target.value }))}
                      placeholder="1234567890"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', color: '#94a3b8', fontWeight: 600 }}>Nama Pemilik Rekening</label>
                  <input
                    value={bankInfo.account_name}
                    onChange={e => setBankInfo(b => ({ ...b, account_name: e.target.value }))}
                    placeholder="Sesuai nama di buku tabungan"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="button"
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
                >
                  <i className={`fa-solid ${submitting ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`} />
                  {submitting ? 'Memproses...' : 'Kirim Permintaan Penarikan'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Ledger */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 20,
        }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
            Riwayat Transaksi
          </h3>

          {loading ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Memuat riwayat...</div>
          ) : ledger.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
              <i className="fa-solid fa-inbox" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8, opacity: 0.4 }} />
              Belum ada transaksi ledger.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ledger.map((item, i) => {
                const typeInfo = TYPE_LABELS[item.transaction_type] || { label: item.transaction_type, color: '#94a3b8' };
                return (
                  <div
                    key={item.id || i}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: i < ledger.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${typeInfo.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="fa-solid fa-arrow-right-arrow-left" style={{ color: typeInfo.color, fontSize: '0.8rem' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: typeInfo.color, fontSize: '0.88rem' }}>
                          {typeInfo.label}
                        </div>
                        {item.description && (
                          <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: 1 }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', flexShrink: 0, fontSize: '0.95rem' }}>
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </SellerLayout>
  );
}
