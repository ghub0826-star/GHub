import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../services/api';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  NOT_SUBMITTED:     { text: 'Belum Dikirim',          color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)',  icon: 'fa-circle-dot'        },
  PENDING:           { text: 'Menunggu Verifikasi',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',  icon: 'fa-clock'             },
  UNDER_REVIEW:      { text: 'Sedang Direview',         color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.25)', icon: 'fa-magnifying-glass'  },
  APPROVED:          { text: 'Terverifikasi',           color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: 'fa-shield-check'      },
  REJECTED:          { text: 'Ditolak',                 color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: 'fa-circle-xmark'      },
  REVISION_REQUIRED: { text: 'Perlu Revisi Dokumen',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)', icon: 'fa-rotate'            },
  SUSPENDED:         { text: 'Akun Ditangguhkan',       color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: 'fa-ban'               },
  VERIFIED:          { text: 'Terverifikasi',           color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: 'fa-shield-check'      },
};

// ── Camera Module ─────────────────────────────────────────────────────────────
function CameraCapture({ onCapture, onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [ready,  setReady]  = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch(e => setCameraError(
        e.name === 'NotAllowedError'
          ? 'Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.'
          : 'Kamera tidak tersedia di perangkat ini.'
      ));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      onCapture(blob, canvas.toDataURL('image/jpeg', 0.85));
    }, 'image/jpeg', 0.85);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
      {cameraError ? (
        <div style={{ color:'#ef4444', padding:'14px 16px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontSize:'0.875rem', textAlign:'center' }}>
          <i className='fa-solid fa-circle-exclamation' style={{ marginRight:8 }} />{cameraError}
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:'100%', maxWidth:380, borderRadius:12, background:'#000', display: ready ? 'block' : 'none' }} />
          {!ready && <div style={{ padding:32, color:'#64748b' }}><i className='fa-solid fa-spinner fa-spin' style={{ marginRight:8 }} />Memuat kamera...</div>}
          <canvas ref={canvasRef} style={{ display:'none' }} />
        </>
      )}
      <div style={{ display:'flex', gap:10 }}>
        {ready && !cameraError && (
          <button onClick={capture} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:'0.875rem', background:'rgba(34,211,238,0.15)', border:'1px solid rgba(34,211,238,0.3)', color:'#22d3ee' }}>
            <i className='fa-solid fa-camera' /> Ambil Foto
          </button>
        )}
        <button onClick={onClose} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:'0.875rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8' }}>
          <i className='fa-solid fa-xmark' /> Batal
        </button>
      </div>
    </div>
  );
}

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('image', file);
  fd.append('folder', 'kyc');
  const res = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  const url = res.data?.url || res.data?.data?.url;
  if (!url) throw new Error('Upload gagal — URL tidak ditemukan.');
  return url;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SellerIdentityVerification() {
  const [status,     setStatus]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreed,     setAgreed]     = useState(false);

  // Identity fields
  const [identityName,  setIdentityName]  = useState('');
  const [ktpNumber,     setKtpNumber]     = useState('');
  const [dateOfBirth,   setDateOfBirth]   = useState('');

  // KTP document
  const [ktpFile,    setKtpFile]    = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [ktpUrl,     setKtpUrl]     = useState(null);
  const ktpInputRef = useRef(null);

  // Selfie document
  const [selfieFile,    setSelfieFile]    = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieUrl,     setSelfieUrl]     = useState(null);
  const [showCamera,    setShowCamera]    = useState(false);
  const selfieInputRef = useRef(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/seller/kyc/status');
      setStatus(r.data);
    } catch {
      setStatus({ kyc_status: 'NOT_SUBMITTED' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Revoke object URLs on cleanup
  useEffect(() => {
    return () => {
      if (ktpPreview && ktpPreview.startsWith('blob:')) URL.revokeObjectURL(ktpPreview);
      if (selfiePreview && selfiePreview.startsWith('blob:')) URL.revokeObjectURL(selfiePreview);
    };
  }, [ktpPreview, selfiePreview]);

  const validateImageFile = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return 'File harus berupa gambar (JPG, PNG, WEBP).';
    if (file.size > 5 * 1024 * 1024) return 'Ukuran file maksimal 5 MB.';
    return null;
  };

  const onKtpChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setMsg({ type:'error', text: err }); return; }
    if (ktpPreview?.startsWith('blob:')) URL.revokeObjectURL(ktpPreview);
    setKtpFile(file);
    setKtpPreview(URL.createObjectURL(file));
    setKtpUrl(null);
    setMsg(null);
    e.target.value = '';
  };

  const onSelfieCapture = (blob, dataUrl) => {
    if (selfiePreview?.startsWith('blob:')) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    setSelfiePreview(dataUrl);
    setSelfieUrl(null);
    setShowCamera(false);
    setMsg(null);
  };

  const onSelfieFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setMsg({ type:'error', text: err }); return; }
    if (selfiePreview?.startsWith('blob:')) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setSelfieUrl(null);
    setMsg(null);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!identityName.trim()) { setMsg({ type:'error', text:'Nama lengkap sesuai KTP wajib diisi.' }); return; }
    if (!ktpNumber.replace(/\D/g, '') || ktpNumber.replace(/\D/g, '').length < 8) { setMsg({ type:'error', text:'Nomor KTP tidak valid.' }); return; }
    if (!ktpFile && !ktpUrl)     { setMsg({ type:'error', text:'Foto KTP wajib diunggah.' }); return; }
    if (!selfieFile && !selfieUrl) { setMsg({ type:'error', text:'Foto selfie wajib diambil atau diunggah.' }); return; }
    if (!agreed)                 { setMsg({ type:'error', text:'Centang pernyataan persetujuan untuk melanjutkan.' }); return; }

    setSubmitting(true);
    setMsg(null);
    try {
      const [finalKtp, finalSelfie] = await Promise.all([
        ktpUrl    || uploadFile(ktpFile),
        selfieUrl || uploadFile(selfieFile),
      ]);
      setKtpUrl(finalKtp); setSelfieUrl(finalSelfie);

      await api.post('/seller/kyc/submit', {
        ktp_url:            finalKtp,
        selfie_url:         finalSelfie,
        identity_full_name: identityName.trim(),
        ktp_number:         ktpNumber.replace(/\D/g, ''),
        date_of_birth:      dateOfBirth || null,
      });
      setMsg({ type:'success', text:'Dokumen identitas berhasil dikirim. Tim kami akan memeriksa dalam 1–3 hari kerja.' });
      loadStatus();
    } catch (e) {
      setMsg({ type:'error', text: e?.response?.data?.message || 'Gagal mengirim dokumen. Coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'50vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
      <i className='fa-solid fa-spinner fa-spin' style={{ marginRight:10, fontSize:'1.3rem' }} />Memuat...
    </div>
  );

  const kycStatus  = status?.kyc_status || 'NOT_SUBMITTED';
  const statusConf = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.NOT_SUBMITTED;
  const isApproved     = kycStatus === 'APPROVED' || kycStatus === 'VERIFIED';
  const isPending      = kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW';
  const isRevision     = kycStatus === 'REVISION_REQUIRED';
  const canSubmit      = ['NOT_SUBMITTED', 'REJECTED', 'REVISION_REQUIRED'].includes(kycStatus);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px', display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div>
        <h1 style={{ color:'#f7f8ff', fontSize:'1.4rem', fontWeight:800, margin:'0 0 6px', display:'flex', alignItems:'center', gap:10 }}>
          <i className='fa-solid fa-id-card' style={{ color:'#22d3ee' }} />
          Verifikasi Identitas (KYC)
        </h1>
        <p style={{ color:'#64748b', fontSize:'0.875rem', margin:0 }}>
          Verifikasi identitas diperlukan untuk mengaktifkan fitur penarikan dana dan membuka toko.
        </p>
      </div>

      {/* Status banner */}
      <div style={{ padding:'14px 18px', borderRadius:12, background:statusConf.bg, border:`1px solid ${statusConf.border}`, color:statusConf.color, display:'flex', alignItems:'flex-start', gap:12 }}>
        <i className={`fa-solid ${statusConf.icon}`} style={{ marginTop:2, fontSize:'1.1rem', flexShrink:0 }} />
        <div>
          <div style={{ fontWeight:700, marginBottom:3 }}>{statusConf.text}</div>
          {kycStatus === 'REJECTED' && status?.rejection_reason && (
            <div style={{ fontSize:'0.82rem', color:'#fca5a5', marginTop:4 }}>
              <strong>Alasan penolakan:</strong> {status.rejection_reason}
            </div>
          )}
          {isRevision && status?.revision_reason && (
            <div style={{ fontSize:'0.82rem', color:'#fdba74', marginTop:4 }}>
              <strong>Catatan revisi:</strong> {status.revision_reason}
            </div>
          )}
          {isPending && (
            <div style={{ fontSize:'0.82rem', fontWeight:400, marginTop:4, opacity:0.9 }}>
              Dokumen sedang diperiksa. Anda tetap dapat menggunakan akun selama proses berlangsung.
            </div>
          )}
          {isRevision && (
            <div style={{ fontSize:'0.82rem', fontWeight:400, marginTop:4, opacity:0.9 }}>
              Silakan perbaiki dokumen Anda dan kirim ulang.
            </div>
          )}
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div style={{ padding:'10px 16px', borderRadius:10, fontWeight:600, fontSize:'0.875rem', background: msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`, color: msg.type==='success'?'#10b981':'#ef4444', display:'flex', alignItems:'flex-start', gap:10 }}>
          <i className={`fa-solid ${msg.type==='success'?'fa-circle-check':'fa-circle-exclamation'}`} style={{ marginTop:2, flexShrink:0 }} />
          <span>{msg.text}</span>
        </div>
      )}

      {isApproved && (
        <div className='card' style={{ padding:28, textAlign:'center' }}>
          <i className='fa-solid fa-shield-check' style={{ fontSize:'2.8rem', color:'#10b981', marginBottom:14, display:'block' }} />
          <div style={{ color:'#f7f8ff', fontWeight:800, fontSize:'1.1rem', marginBottom:8 }}>Identitas Terverifikasi</div>
          <p style={{ color:'#64748b', fontSize:'0.875rem', margin:0 }}>
            Identitas Anda telah diverifikasi dengan sukses. Semua fitur toko tersedia.
          </p>
        </div>
      )}

      {canSubmit && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Info */}
          <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.6 }}>
            <i className='fa-solid fa-circle-info' style={{ marginRight:8, color:'#818cf8' }} />
            Upload foto KTP yang <strong style={{ color:'#e2e8f0' }}>jelas dan terbaca</strong>, lalu ambil selfie sambil <strong style={{ color:'#e2e8f0' }}>memegang KTP</strong>. Data digunakan hanya untuk verifikasi internal.
          </div>

          {/* ── Identity Fields ─────────────────────────────────── */}
          <div className='card' style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
            <h3 style={{ color:'#f7f8ff', fontSize:'0.95rem', margin:0, display:'flex', alignItems:'center', gap:8 }}>
              <i className='fa-solid fa-user-check' style={{ color:'#22d3ee' }} /> Data Identitas
            </h3>

            <div>
              <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', fontWeight:600, marginBottom:5 }}>
                Nama Lengkap (sesuai KTP) <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <input
                value={identityName}
                onChange={e => setIdentityName(e.target.value)}
                placeholder="Nama lengkap sesuai KTP"
                style={{ width:'100%' }}
                disabled={submitting}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', fontWeight:600, marginBottom:5 }}>
                Nomor KTP (NIK) <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <input
                value={ktpNumber}
                onChange={e => setKtpNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="16 digit nomor KTP"
                inputMode="numeric"
                maxLength={16}
                style={{ width:'100%', fontFamily:'monospace', letterSpacing:'0.08em' }}
                disabled={submitting}
              />
              <div style={{ fontSize:'0.75rem', color:'#475569', marginTop:4 }}>
                Nomor KTP akan dimasking di sistem (****xxxx)
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', fontWeight:600, marginBottom:5 }}>
                Tanggal Lahir (opsional)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                style={{ width:'100%' }}
                disabled={submitting}
              />
            </div>
          </div>

          {/* ── KTP Upload ──────────────────────────────────────── */}
          <div className='card' style={{ padding:20 }}>
            <h3 style={{ color:'#f7f8ff', fontSize:'0.95rem', margin:'0 0 10px', display:'flex', alignItems:'center', gap:8 }}>
              <i className='fa-solid fa-address-card' style={{ color:'#22d3ee' }} /> Foto KTP
            </h3>
            <p style={{ color:'#64748b', fontSize:'0.82rem', margin:'0 0 14px' }}>
              Upload foto KTP yang jelas dan terbaca. Semua teks harus terlihat. (Maks 5 MB)
            </p>

            {ktpPreview && (
              <div style={{ marginBottom:14, borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                <img src={ktpPreview} alt='KTP preview' style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }} />
              </div>
            )}

            <input ref={ktpInputRef} type='file' accept='image/jpeg,image/png,image/webp' style={{ display:'none' }} onChange={onKtpChange} />
            <button
              onClick={() => ktpInputRef.current?.click()}
              disabled={submitting}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:9, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8', opacity: submitting?0.5:1 }}
            >
              <i className='fa-solid fa-upload' />
              {ktpPreview ? 'Ganti Foto KTP' : 'Upload Foto KTP'}
            </button>
          </div>

          {/* ── Selfie Section ──────────────────────────────────── */}
          <div className='card' style={{ padding:20 }}>
            <h3 style={{ color:'#f7f8ff', fontSize:'0.95rem', margin:'0 0 10px', display:'flex', alignItems:'center', gap:8 }}>
              <i className='fa-solid fa-camera' style={{ color:'#22d3ee' }} /> Foto Selfie + KTP
            </h3>
            <p style={{ color:'#64748b', fontSize:'0.82rem', margin:'0 0 14px' }}>
              Ambil selfie <strong style={{ color:'#e2e8f0' }}>sambil memegang KTP</strong> agar wajah dan KTP terlihat jelas. (Maks 5 MB)
            </p>

            {showCamera ? (
              <div style={{ marginBottom:14 }}>
                <CameraCapture onCapture={onSelfieCapture} onClose={() => setShowCamera(false)} />
              </div>
            ) : (
              <>
                {selfiePreview && (
                  <div style={{ marginBottom:14, borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <img src={selfiePreview} alt='Selfie preview' style={{ width:'100%', maxHeight:240, objectFit:'cover', display:'block' }} />
                  </div>
                )}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <button
                    onClick={() => setShowCamera(true)}
                    disabled={submitting}
                    style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:9, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)', color:'#22d3ee', opacity: submitting?0.5:1 }}
                  >
                    <i className='fa-solid fa-camera' />
                    {selfiePreview ? 'Ambil Ulang Foto' : 'Ambil Foto'}
                  </button>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:9, cursor: submitting?'not-allowed':'pointer', fontSize:'0.82rem', fontWeight:600, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8', opacity: submitting?0.5:1 }}>
                    <i className='fa-solid fa-upload' />Upload Foto
                    <input ref={selfieInputRef} type='file' accept='image/jpeg,image/png,image/webp' style={{ display:'none' }} onChange={onSelfieFileChange} disabled={submitting} />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* ── Agreement ──────────────────────────────────────── */}
          <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer', padding:'14px 18px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <input
              type='checkbox'
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              disabled={submitting}
              style={{ width:16, height:16, marginTop:2, flexShrink:0, accentColor:'#22d3ee' }}
            />
            <span style={{ fontSize:'0.83rem', color:'#94a3b8', lineHeight:1.5 }}>
              Saya menyatakan bahwa <strong style={{ color:'#e2e8f0' }}>data dan dokumen yang saya berikan adalah benar</strong> dan merupakan milik saya sendiri. Saya memahami bahwa informasi ini digunakan hanya untuk proses verifikasi identitas.
            </span>
          </label>

          {/* ── Submit Button ──────────────────────────────────── */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !identityName.trim() || !ktpNumber || (!ktpFile && !ktpUrl) || (!selfieFile && !selfieUrl) || !agreed}
            style={{
              padding:'13px 28px', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:'0.95rem',
              background:'rgba(34,211,238,0.15)', border:'1px solid rgba(34,211,238,0.3)', color:'#22d3ee',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              opacity: (submitting || !identityName.trim() || !ktpNumber || (!ktpFile && !ktpUrl) || (!selfieFile && !selfieUrl) || !agreed) ? 0.45 : 1,
              transition:'opacity 0.15s',
            }}
          >
            {submitting
              ? <><i className='fa-solid fa-spinner fa-spin' />Mengirim Dokumen...</>
              : <><i className='fa-solid fa-paper-plane' />Kirim untuk Verifikasi</>
            }
          </button>
        </div>
      )}

      {/* Previously submitted info */}
      {status?.identity_full_name && !canSubmit && (
        <div className='card' style={{ padding:18 }}>
          <h4 style={{ color:'#f7f8ff', margin:'0 0 12px', fontSize:'0.9rem' }}>Data yang Dikirim</h4>
          <div style={{ display:'grid', gap:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem' }}>
              <span style={{ color:'#64748b' }}>Nama</span>
              <span style={{ color:'#e2e8f0', fontWeight:600 }}>{status.identity_full_name}</span>
            </div>
            {status.ktp_number_masked && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem' }}>
                <span style={{ color:'#64748b' }}>Nomor KTP</span>
                <span style={{ color:'#e2e8f0', fontFamily:'monospace', letterSpacing:'0.08em' }}>{status.ktp_number_masked}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem' }}>
              <span style={{ color:'#64748b' }}>Foto KTP</span>
              <span style={{ color: status.has_ktp ? '#10b981' : '#ef4444' }}>
                <i className={`fa-solid ${status.has_ktp ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight:5 }} />
                {status.has_ktp ? 'Tersedia' : 'Belum ada'}
              </span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem' }}>
              <span style={{ color:'#64748b' }}>Foto Selfie</span>
              <span style={{ color: status.has_selfie ? '#10b981' : '#ef4444' }}>
                <i className={`fa-solid ${status.has_selfie ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight:5 }} />
                {status.has_selfie ? 'Tersedia' : 'Belum ada'}
              </span>
            </div>
            {status.submitted_at && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem' }}>
                <span style={{ color:'#64748b' }}>Dikirim</span>
                <span style={{ color:'#94a3b8' }}>{new Date(status.submitted_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
