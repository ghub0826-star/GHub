import React, { useEffect, useState, useCallback, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import api from '../../services/api';

/* ─── helpers ─────────────────────────────────────────── */
const fmt = d => d
  ? new Date(d).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  : '—';

/* ─── status map ──────────────────────────────────────── */
const STATUS = {
  PENDING:           { label: 'Pending',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.28)',  icon: 'fa-clock' },
  UNDER_REVIEW:      { label: 'Under Review',  color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',   border: 'rgba(56,189,248,0.28)',  icon: 'fa-magnifying-glass' },
  APPROVED:          { label: 'Approved',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.28)',  icon: 'fa-circle-check' },
  REJECTED:          { label: 'Rejected',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.28)',   icon: 'fa-circle-xmark' },
  REVISION_REQUIRED: { label: 'Revision',      color: '#f97316', bg: 'rgba(249,115,22,0.12)',   border: 'rgba(249,115,22,0.28)',  icon: 'fa-rotate' },
  SUSPENDED:         { label: 'Suspended',     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',   border: 'rgba(148,163,184,0.22)', icon: 'fa-ban' },
  NOT_SUBMITTED:     { label: 'Not Submitted', color: '#64748b', bg: 'rgba(100,116,139,0.08)',  border: 'rgba(100,116,139,0.18)', icon: 'fa-circle-dot' },
};

/* ─── KycBadge ────────────────────────────────────────── */
function KycBadge({ status }) {
  const k = String(status || '').toUpperCase();
  const s = STATUS[k] || STATUS.NOT_SUBMITTED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.71rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      <i className={`fa-solid ${s.icon}`} style={{ fontSize: '0.62rem' }} />
      {s.label}
    </span>
  );
}

/* ─── Section header ──────────────────────────────────── */
function SecHead({ icon, color = '#818cf8', children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 14,
      fontSize: '0.73rem', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.09em',
      color: '#64748b',
    }}>
      <i className={`fa-solid ${icon}`} style={{ color, fontSize: '0.78rem' }} />
      {children}
    </div>
  );
}

/* ─── Section card wrapper ────────────────────────────── */
function Sec({ children, style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '16px 18px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Alert ───────────────────────────────────────────── */
function Alert({ type, children }) {
  const ok = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '11px 14px', borderRadius: 10, marginBottom: 16,
      fontSize: '0.875rem', fontWeight: 600,
      background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      color: ok ? '#10b981' : '#ef4444',
    }}>
      <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-exclamation'}`} style={{ marginTop: 1, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

/* ─── Image Lightbox ──────────────────────────────────── */
function Lightbox({ src, label, onClose }) {
  if (!src) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 'var(--navbar-height, 76px)',
        left: 0, right: 0, bottom: 0,
        zIndex: 8500,
        background: 'rgba(0,0,0,0.94)',
        backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <i className='fa-solid fa-image' style={{ color: '#22d3ee' }} />
        {label}
      </div>
      <img
        src={src} alt={label} onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '88vw', maxHeight: '78vh',
          borderRadius: 14, objectFit: 'contain',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
        }}
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 9,
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        }}
      >
        <i className='fa-solid fa-xmark' /> Tutup
      </button>
    </div>
  );
}

/* ─── Confirm Modal ───────────────────────────────────── */
function ConfirmModal({ title, desc, placeholder, requireReason, onConfirm, onCancel, confirmLabel = 'Konfirmasi', danger = false }) {
  const [reason, setReason] = useState('');
  const disabled = requireReason && !reason.trim();
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: 'fixed',
        top: 'var(--navbar-height, 76px)',
        left: 0, right: 0, bottom: 0,
        zIndex: 8600,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        width: 'min(480px,96vw)',
        background: '#0d0f1e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 28,
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: desc ? 10 : 18 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
          }}>
            <i
              className={`fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}
              style={{ color: danger ? '#ef4444' : '#818cf8', fontSize: '1rem' }}
            />
          </div>
          <h3 style={{ margin: 0, color: '#f7f8ff', fontSize: '1.05rem', fontWeight: 800 }}>{title}</h3>
        </div>

        {desc && (
          <p style={{ margin: '0 0 16px 50px', color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</p>
        )}

        {placeholder && (
          <textarea
            rows={3} autoFocus
            className='admin-search'
            placeholder={placeholder}
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{ width: '100%', resize: 'vertical', marginBottom: 16, fontFamily: 'inherit' }}
          />
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 9, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
            }}
          >
            <i className='fa-solid fa-xmark' /> Batal
          </button>
          <button
            disabled={disabled}
            onClick={() => onConfirm(reason.trim())}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 9, cursor: disabled ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.875rem', opacity: disabled ? 0.4 : 1,
              background: danger ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              border: danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
              color: danger ? '#ef4444' : '#10b981',
            }}
          >
            <i className={`fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-check'}`} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Detail Drawer
   ══════════════════════════════════════════════════════════ */
function KycDetailDrawer({ sellerId, onClose, onRefresh }) {
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [modal,   setModal]   = useState(null);
  const [lightbox,setLightbox]= useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/kyc/${sellerId}`);
      setDetail(r.data?.data || null);
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Gagal memuat data KYC.' });
    } finally { setLoading(false); }
  }, [sellerId]);

  useEffect(() => { load(); }, [load]);

  const run = async (apiFn, successMsg) => {
    setBusy(true); setMsg(null); setModal(null);
    try {
      await apiFn();
      setMsg({ type: 'success', text: successMsg });
      onRefresh();
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Gagal. Coba lagi.' });
    } finally { setBusy(false); }
  };

  const d   = detail;
  const kyc = d?.kyc_status || (d?.identity_verified ? 'APPROVED' : (d?.status || 'PENDING'));
  const isApproved = kyc === 'APPROVED' || Boolean(d?.identity_verified);
  const isActionable = ['PENDING', 'UNDER_REVIEW'].includes(kyc);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        className='admin-drawer-backdrop'
      >
        {/* Panel */}
        <div className='admin-drawer' style={{ width: 'min(640px,100vw)' }}>

          {/* ── Header ── */}
          <div className='admin-drawer-header'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                background: 'rgba(34,211,238,0.12)', color: '#22d3ee',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              }}>
                <i className='fa-solid fa-id-card' />
              </div>
              <div>
                <h2 className='admin-drawer-title'>Review KYC Seller</h2>
                {d && <p className='admin-drawer-sub'>ID #{d.seller_id} · {d.email}</p>}
              </div>
            </div>
            <button className='admin-drawer-close' onClick={onClose} aria-label='Tutup'>
              <i className='fa-solid fa-xmark' />
            </button>
          </div>

          {/* ── Body ── */}
          <div className='admin-drawer-body'>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <i className='fa-solid fa-spinner fa-spin' style={{ fontSize: '1.8rem', display: 'block', marginBottom: 12, color: '#818cf8' }} />
                <div style={{ fontWeight: 600 }}>Memuat data KYC...</div>
              </div>
            )}

            {/* Alert */}
            {msg && <Alert type={msg.type}>{msg.text}</Alert>}

            {d && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* ── Status bar ── */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 10,
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <KycBadge status={kyc} />
                    {d.submitted_at && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <i className='fa-solid fa-paper-plane' style={{ fontSize: '0.68rem' }} />
                        Dikirim {fmt(d.submitted_at)}
                      </span>
                    )}
                  </div>
                  {d.reviewed_at && (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <i className='fa-solid fa-user-check' style={{ fontSize: '0.68rem' }} />
                      Direview {fmt(d.reviewed_at)}
                    </span>
                  )}
                </div>

                {/* ── Seller info ── */}
                <Sec>
                  <SecHead icon='fa-circle-user'>Informasi Seller</SecHead>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10 }}>
                    {[
                      { icon: 'fa-user',         label: 'Nama Seller', value: d.full_name || d.username || '—' },
                      { icon: 'fa-envelope',     label: 'Email',       value: d.email || '—' },
                      { icon: 'fa-address-card', label: 'Nama KTP',    value: d.identity_full_name || '—' },
                      { icon: 'fa-hashtag',      label: 'NIK',         value: d.ktp_number || d.ktp_number_masked || '—' },
                    ].map(item => (
                      <div key={item.label} style={{
                        padding: '10px 12px', borderRadius: 9,
                        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <i className={`fa-solid ${item.icon}`} style={{ fontSize: '0.68rem' }} />
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 600, wordBreak: 'break-word' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* ── Dokumen status pills ── */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Foto KTP',    ok: Boolean(d.has_ktp    ?? d.ktp_signed_url),    icon: 'fa-address-card' },
                    { label: 'Foto Selfie', ok: Boolean(d.has_selfie ?? d.selfie_signed_url), icon: 'fa-camera' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '7px 14px', borderRadius: 20,
                        fontSize: '0.8rem', fontWeight: 700,
                        background: item.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${item.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
                        color: item.ok ? '#10b981' : '#ef4444',
                      }}
                    >
                      <i className={`fa-solid ${item.ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                      <i className={`fa-solid ${item.icon}`} style={{ fontSize: '0.75rem', opacity: 0.75 }} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* ── Dokumen viewer ── */}
                {(d.ktp_signed_url || d.selfie_signed_url) ? (
                  <Sec>
                    <SecHead icon='fa-lock' color='#f59e0b'>Dokumen Identitas (Akses Aman · 10 menit)</SecHead>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                      {[
                        { label: 'Foto KTP',        url: d.ktp_signed_url,    icon: 'fa-address-card' },
                        { label: 'Foto Selfie + KTP', url: d.selfie_signed_url, icon: 'fa-camera' },
                      ].map(doc => (
                        <div key={doc.label}>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                            <i className={`fa-solid ${doc.icon}`} style={{ color: '#818cf8', fontSize: '0.75rem' }} />
                            {doc.label}
                          </div>
                          {doc.url ? (
                            <div
                              onClick={() => setLightbox({ src: doc.url, label: doc.label })}
                              style={{
                                cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.08)', background: '#000',
                                position: 'relative', transition: 'border-color 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                            >
                              <img
                                src={doc.url} alt={doc.label}
                                style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                padding: '8px', textAlign: 'center',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              }}>
                                <i className='fa-solid fa-magnifying-glass-plus' style={{ fontSize: '0.7rem' }} />
                                Klik untuk perbesar
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              height: 170, borderRadius: 10, display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center', gap: 8,
                              border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)',
                              color: '#475569', fontSize: '0.8rem',
                            }}>
                              <i className='fa-solid fa-image-slash' style={{ fontSize: '1.4rem', opacity: 0.3 }} />
                              Tidak tersedia
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 12, padding: '9px 13px', borderRadius: 9,
                      background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                      fontSize: '0.76rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <i className='fa-solid fa-circle-info' style={{ flexShrink: 0 }} />
                      URL dokumen berlaku 10 menit. Refresh halaman jika gambar tidak muncul.
                    </div>
                  </Sec>
                ) : (
                  <div style={{
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: '0.85rem', color: '#a5b4fc',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <i className='fa-solid fa-lock' style={{ fontSize: '1rem', color: '#818cf8', flexShrink: 0 }} />
                    Akses dokumen KTP/selfie hanya tersedia untuk <strong style={{ marginLeft: 4 }}>Super Admin</strong>.
                  </div>
                )}

                {/* ── Rejection / Revision reason ── */}
                {d.rejection_reason && (
                  <div style={{
                    padding: '11px 16px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    fontSize: '0.85rem', color: '#fca5a5', display: 'flex', gap: 10,
                  }}>
                    <i className='fa-solid fa-circle-xmark' style={{ marginTop: 1, flexShrink: 0 }} />
                    <div><strong>Alasan Penolakan:</strong> {d.rejection_reason}</div>
                  </div>
                )}
                {d.revision_reason && (
                  <div style={{
                    padding: '11px 16px', borderRadius: 10,
                    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)',
                    fontSize: '0.85rem', color: '#fdba74', display: 'flex', gap: 10,
                  }}>
                    <i className='fa-solid fa-rotate' style={{ marginTop: 1, flexShrink: 0 }} />
                    <div><strong>Catatan Revisi:</strong> {d.revision_reason}</div>
                  </div>
                )}
                {d.reviewer_name && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <i className='fa-solid fa-user-check' style={{ color: '#818cf8' }} />
                    Direview oleh: <strong style={{ color: '#94a3b8', marginLeft: 4 }}>{d.reviewer_name}</strong>
                  </div>
                )}

                {/* ── Action buttons ── */}
                {!isApproved && (
                  <Sec>
                    <SecHead icon='fa-gavel'>Aksi Verifikasi</SecHead>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

                      {kyc === 'PENDING' && (
                        <button disabled={busy} onClick={() => setModal({ type: 'review' })} style={btnStyle('#38bdf8')}>
                          <i className='fa-solid fa-magnifying-glass' /> Mulai Review
                        </button>
                      )}

                      {isActionable && (
                        <>
                          <button disabled={busy} onClick={() => setModal({ type: 'approve' })} style={btnStyle('#10b981')}>
                            <i className='fa-solid fa-circle-check' /> Setujui KYC
                          </button>
                          <button disabled={busy} onClick={() => setModal({ type: 'reject' })} style={btnStyle('#ef4444')}>
                            <i className='fa-solid fa-circle-xmark' /> Tolak
                          </button>
                          <button disabled={busy} onClick={() => setModal({ type: 'revision' })} style={btnStyle('#f97316')}>
                            <i className='fa-solid fa-rotate' /> Minta Revisi
                          </button>
                        </>
                      )}

                      {['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(kyc) && (
                        <button disabled={busy} onClick={() => setModal({ type: 'suspend' })} style={btnStyle('#94a3b8')}>
                          <i className='fa-solid fa-ban' /> Suspend
                        </button>
                      )}
                    </div>
                  </Sec>
                )}

                {/* ── History ── */}
                {d.history?.length > 0 && (
                  <Sec>
                    <SecHead icon='fa-clock-rotate-left'>Riwayat Verifikasi</SecHead>
                    <div>
                      {d.history.map((h, i) => (
                        <div
                          key={h.id || i}
                          style={{
                            display: 'flex', gap: 12, padding: '11px 0',
                            borderBottom: i < d.history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          }}
                        >
                          <div style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
                            background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className='fa-solid fa-clock-rotate-left' style={{ fontSize: '0.72rem', color: '#818cf8' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>
                              {h.action?.replace(/_/g, ' ')}
                            </div>
                            {h.reason && (
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                <strong>Alasan:</strong> {h.reason}
                              </div>
                            )}
                            <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <i className='fa-solid fa-clock' style={{ fontSize: '0.62rem' }} />
                              {h.admin_name ? `${h.admin_name} · ` : ''}{fmt(h.created_at)}
                            </div>
                          </div>
                          {h.new_status && (
                            <div style={{ flexShrink: 0, paddingTop: 2 }}>
                              <KycBadge status={h.new_status} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Sec>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal?.type === 'review' && (
        <ConfirmModal
          title='Mulai Review KYC'
          desc={`Tandai KYC "${d?.full_name}" sebagai "Under Review"? Seller akan menerima notifikasi.`}
          confirmLabel='Mulai Review'
          onCancel={() => setModal(null)}
          onConfirm={() => run(() => api.post(`/admin/kyc/${sellerId}/start-review`), 'Status diubah ke Under Review.')}
        />
      )}
      {modal?.type === 'approve' && (
        <ConfirmModal
          title='Setujui KYC Seller'
          desc={`Setujui verifikasi "${d?.full_name}"? Pastikan KTP dan selfie sudah diperiksa.`}
          placeholder='Catatan internal (opsional)...'
          confirmLabel='Konfirmasi Persetujuan'
          onCancel={() => setModal(null)}
          onConfirm={note => run(() => api.post(`/admin/kyc/${sellerId}/approve`, { note }), 'KYC berhasil disetujui.')}
        />
      )}
      {modal?.type === 'reject' && (
        <ConfirmModal
          title='Tolak KYC Seller' danger
          desc={`Tolak verifikasi "${d?.full_name}". Seller akan menerima notifikasi penolakan.`}
          placeholder='Alasan penolakan (wajib)...'
          requireReason confirmLabel='Tolak KYC'
          onCancel={() => setModal(null)}
          onConfirm={reason => run(() => api.post(`/admin/kyc/${sellerId}/reject`, { reason }), 'KYC seller ditolak.')}
        />
      )}
      {modal?.type === 'revision' && (
        <ConfirmModal
          title='Minta Revisi Dokumen'
          desc={`Minta "${d?.full_name}" untuk memperbaiki dokumen KYC-nya.`}
          placeholder='Catatan revisi untuk seller (wajib)...'
          requireReason confirmLabel='Kirim Permintaan Revisi'
          onCancel={() => setModal(null)}
          onConfirm={reason => run(() => api.post(`/admin/kyc/${sellerId}/request-revision`, { reason }), 'Permintaan revisi dikirim.')}
        />
      )}
      {modal?.type === 'suspend' && (
        <ConfirmModal
          title='Suspend KYC Seller' danger
          desc={`Suspend KYC "${d?.full_name}"? Tindakan ini akan membekukan akses seller.`}
          placeholder='Alasan suspend (opsional)...'
          confirmLabel='Suspend KYC'
          onCancel={() => setModal(null)}
          onConfirm={reason => run(() => api.post(`/admin/kyc/${sellerId}/suspend`, { reason }), 'KYC seller disuspend.')}
        />
      )}

      {lightbox && <Lightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />}
    </>
  );
}

/* tiny helper — action button style */
function btnStyle(c) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '9px 16px', borderRadius: 9,
    cursor: 'pointer', fontWeight: 700, fontSize: '0.84rem',
    background: `${c}18`, border: `1px solid ${c}44`, color: c,
  };
}

/* ══════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════ */
export default function SuperAdminKycReview() {
  const [items,      setItems]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('');
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null);
  const debounceRef = useRef(null);

  const load = useCallback(async (page = 1, q = search, status = filter) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      if (q)      params.search = q;
      const r = await api.get('/admin/kyc', { params });
      setItems(r.data?.data || []);
      setStats(r.data?.stats || null);
      setPagination(r.data?.pagination || { page, limit: 20, total: 0 });
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [search, filter]); // eslint-disable-line

  useEffect(() => { load(1); }, []); // eslint-disable-line

  const onSearch = val => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(1, val, filter), 380);
  };

  const onFilter = val => {
    setFilter(val);
    load(1, search, val);
  };

  const { page, total } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const computeStatus = row =>
    row.identity_verified ? 'APPROVED' : (row.status?.toUpperCase() || 'PENDING');

  const STAT_CARDS = [
    { label: 'Total Submit', key: 'total_submitted', color: '#22d3ee', icon: 'fa-clipboard-list' },
    { label: 'Pending',      key: 'pending',          color: '#f59e0b', icon: 'fa-clock' },
    { label: 'Under Review', key: 'under_review',     color: '#38bdf8', icon: 'fa-magnifying-glass' },
    { label: 'Approved',     key: 'approved',         color: '#10b981', icon: 'fa-circle-check' },
    { label: 'Rejected',     key: 'rejected',         color: '#ef4444', icon: 'fa-circle-xmark' },
    { label: 'Revision',     key: 'revision_required',color: '#f97316', icon: 'fa-rotate' },
  ];

  const FILTER_OPTS = [
    { value: '',                  label: 'Semua Status' },
    { value: 'PENDING',           label: 'Pending' },
    { value: 'UNDER_REVIEW',      label: 'Under Review' },
    { value: 'APPROVED',          label: 'Approved' },
    { value: 'REJECTED',          label: 'Rejected' },
    { value: 'REVISION_REQUIRED', label: 'Revision Required' },
    { value: 'SUSPENDED',         label: 'Suspended' },
  ];

  return (
    <AdminLayout title='KYC Verification' subtitle='Review dan verifikasi identitas seller — KTP & Selfie'>

      {/* ── Stats ── */}
      {stats && (
        <div className='admin-stat-grid' style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))' }}>
          {STAT_CARDS.map(s => (
            <div key={s.key} className='admin-stat-card' style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className='admin-stat-value' style={{ color: s.color, fontSize: '1.8rem' }}>
                  {stats[s.key] ?? 0}
                </div>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${s.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '0.9rem' }} />
                </div>
              </div>
              <div className='admin-stat-label'>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className='admin-filter-row' style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
          <i className='fa-solid fa-magnifying-glass' style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: '#4b5563', fontSize: '0.82rem', pointerEvents: 'none',
          }} />
          <input
            className='admin-search'
            placeholder='Cari nama, email, username...'
            value={search}
            onChange={e => onSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 38 }}
          />
        </div>

        <select
          className='admin-select'
          value={filter}
          onChange={e => onFilter(e.target.value)}
          style={{ minWidth: 170 }}
        >
          {FILTER_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => load(page)}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
          }}
        >
          <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate-right'}`} />
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className='admin-table' style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ width: 52 }}>ID</th>
                <th>Seller</th>
                <th>Email</th>
                <th>Nama KTP</th>
                <th>Status</th>
                <th>Dikirim</th>
                <th>Reviewer</th>
                <th>Direview</th>
                <th style={{ textAlign: 'center', width: 110 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '52px 0', color: '#64748b' }}>
                    <i className='fa-solid fa-spinner fa-spin' style={{ fontSize: '1.5rem', display: 'block', marginBottom: 10, color: '#818cf8' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Memuat data KYC...</div>
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                    <i className='fa-solid fa-inbox' style={{ fontSize: '2rem', display: 'block', marginBottom: 12, opacity: 0.3 }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#94a3b8', marginBottom: 4 }}>Tidak ada data KYC</div>
                    <div style={{ fontSize: '0.82rem' }}>Coba ubah filter atau kata kunci pencarian</div>
                  </td>
                </tr>
              )}

              {!loading && items.map(row => (
                <tr key={row.seller_id}>
                  <td style={{ fontWeight: 700, color: '#64748b', fontSize: '0.82rem' }}>
                    #{row.seller_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#f7f8ff', fontSize: '0.9rem' }}>
                      {row.full_name || row.username || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      @{row.username || '—'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.email}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {row.identity_full_name || '—'}
                  </td>
                  <td>
                    <KycBadge status={computeStatus(row)} />
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {fmt(row.submitted_at)}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {row.reviewer_name || '—'}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {fmt(row.reviewed_at)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setSelected(row.seller_id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 13px', borderRadius: 8, cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: 700,
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8',
                      }}
                    >
                      <i className='fa-solid fa-eye' /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className='admin-pagination' style={{ padding: '12px 18px' }}>
          <div className='admin-pagination-info' style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className='fa-solid fa-table-list' style={{ fontSize: '0.75rem' }} />
            Halaman {page} dari {totalPages} · {total} submission
          </div>
          <div className='admin-pagination-btns'>
            <button
              className='admin-page-btn'
              onClick={() => load(page - 1)}
              disabled={page <= 1 || loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <i className='fa-solid fa-chevron-left' style={{ fontSize: '0.68rem' }} /> Prev
            </button>
            <span className='admin-page-btn admin-page-btn--active'>{page}</span>
            <button
              className='admin-page-btn'
              onClick={() => load(page + 1)}
              disabled={page >= totalPages || loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              Next <i className='fa-solid fa-chevron-right' style={{ fontSize: '0.68rem' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Drawer ── */}
      {selected !== null && (
        <KycDetailDrawer
          sellerId={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => load(page)}
        />
      )}

    </AdminLayout>
  );
}
