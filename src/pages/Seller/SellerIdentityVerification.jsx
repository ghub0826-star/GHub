import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../services/api';

const STATUS_LABEL = {
  NOT_SUBMITTED: { text: 'Belum Dikirim',      color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)'  },
  PENDING:       { text: 'Menunggu Verifikasi', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  VERIFIED:      { text: 'Terverifikasi',       color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  REJECTED:      { text: 'Ditolak',             color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)'  },
};

// ── Camera Module ─────────────────────────────────────────────────────────────
function CameraCapture({ onCapture, onClose }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; }
        setReady(true);
      })
      .catch(e => setError(
        e.name === 'NotAllowedError'
          ? 'Akses kamera ditolak. Silakan izinkan kamera di pengaturan browser.'
          : 'Kamera tidak tersedia di perangkat ini.'
      ));
    return () => {
      active = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      onCapture(blob, canvas.toDataURL('image/jpeg', 0.85));
    }, 'image/jpeg', 0.85);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {error ? (
        <div style={{ color: '#ef4444', padding: 16, textAlign: 'center', fontSize: '0.875rem' }}>
          <i className='fa-solid fa-circle-exclamation' style={{ marginRight: 8 }} />{error}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{ width: '100%', maxWidth: 380, borderRadius: 12, background: '#000', display: ready ? 'block' : 'none' }}
          />
          {!ready && <div style={{ padding: 32, color: '#64748b' }}><i className='fa-solid fa-spinner fa-spin' style={{ marginRight: 8 }} />Memuat kamera...</div>}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {ready && !error && (
          <button
            onClick={capture}
            style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:'0.875rem', background:'rgba(34,211,238,0.15)', border:'1px solid rgba(34,211,238,0.3)', color:'#22d3ee' }}
          >
            <i className='fa-solid fa-camera' /> Ambil Foto
          </button>
        )}
        <button
          onClick={onClose}
          style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:'0.875rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8' }}
        >
          <i className='fa-solid fa-xmark' /> Batal
        </button>
      </div>
    </div>
  );
}

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadFile(file, folder = 'kyc') {
  const fd = new FormData();
  fd.append('image', file);
  fd.append('folder', folder);
  const res = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  // Accept both top-level url and nested data.url (backward compat)
  const url = res.data?.url || res.data?.data?.url;
  if (!url) throw new Error('Upload gagal — URL tidak ditemukan dalam response.');
  return url;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SellerIdentityVerification() {
  const [status,      setStatus]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  // KTP
  const [ktpFile,     setKtpFile]     = useState(null);
  const [ktpPreview,  setKtpPreview]  = useState(null);
  const [ktpUrl,      setKtpUrl]      = useState(null);

  // Selfie
  const [selfieFile,  setSelfieFile]  = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieUrl,   setSelfieUrl]   = useState(null);
  const [showCamera,  setShowCamera]  = useState(false);

  const ktpInputRef = useRef(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/seller/kyc/status');
      setStatus(r.data);
    } catch { setStatus({ kyc_status: 'NOT_SUBMITTED' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // KTP file select
  const onKtpChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      setMsg({ type:'error', text:'File KTP harus berupa gambar (JPG, PNG, WEBP).' }); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type:'error', text:'Ukuran file KTP maksimal 5 MB.' }); return;
    }
    setKtpFile(file);
    setKtpPreview(URL.createObjectURL(file));
    setKtpUrl(null);
    setMsg(null);
  };

  // Camera capture callback
  const onSelfieCapture = (blob, dataUrl) => {
    const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setSelfieFile(file);
    setSelfiePreview(dataUrl);
    setSelfieUrl(null);
    setShowCamera(false);
    setMsg(null);
  };

  // Selfie file select (fallback)
  const onSelfieFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      setMsg({ type:'error', text:'File selfie harus berupa gambar.' }); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type:'error', text:'Ukuran file selfie maksimal 5 MB.' }); return;
    }
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setSelfieUrl(null);
    setMsg(null);
  };

  const handleSubmit = async () => {
    if (!ktpFile && !ktpUrl)     { setMsg({ type:'error', text:'Foto KTP wajib diunggah.' }); return; }
    if (!selfieFile && !selfieUrl) { setMsg({ type:'error', text:'Foto selfie wajib diambil atau diunggah.' }); return; }
    setSubmitting(true); setMsg(null);
    try {
      // Upload jika belum
      const finalKtp    = ktpUrl    || await uploadFile(ktpFile, 'kyc/ktp');
      const finalSelfie = selfieUrl || await uploadFile(selfieFile, 'kyc/selfie');
      if (!finalKtp || !finalSelfie) throw new Error('Upload gagal.');
      // Simpan URL hasil upload (agar tidak re-upload jika submit retry)
      setKtpUrl(finalKtp); setSelfieUrl(finalSelfie);
      await api.post('/seller/kyc/submit', { ktp_url: finalKtp, selfie_url: finalSelfie });
      setMsg({ type:'success', text:'Dokumen identitas berhasil dikirim. Tim kami akan memeriksa dalam 1–3 hari kerja.' });
      loadStatus();
    } catch (e) {
      setMsg({ type:'error', text: e?.response?.data?.message || 'Gagal mengirim dokumen. Coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
      <i className='fa-solid fa-spinner fa-spin' style={{ marginRight:10, fontSize:'1.3rem' }} />Memuat...
    </div>
  );

  const kycStatus  = status?.kyc_status || 'NOT_SUBMITTED';
  const statusInfo = STATUS_LABEL[kycStatus] || STATUS_LABEL.NOT_SUBMITTED;
  const isVerified = kycStatus === 'VERIFIED';
  const isPending  = kycStatus === 'PENDING';

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#f7f8ff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
          <i className='fa-solid fa-id-card' style={{ marginRight: 10, color: '#22d3ee' }} />
          Verifikasi Identitas
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Verifikasi identitas diperlukan untuk mengaktifkan fitur penarikan dana.
        </p>
      </div>

      {/* Status banner */}
      <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 24, background: statusInfo.bg, border: `1px solid ${statusInfo.border}`, color: statusInfo.color, display:'flex', alignItems:'center', gap:10, fontWeight:600 }}>
        <i className={`fa-solid ${isVerified ? 'fa-circle-check' : isPending ? 'fa-clock' : kycStatus === 'REJECTED' ? 'fa-circle-xmark' : 'fa-circle-dot'}`} />
        <div>
          <div>{statusInfo.text}</div>
          {kycStatus === 'REJECTED' && status?.rejection_reason && (
            <div style={{ fontSize:'0.78rem', fontWeight:400, marginTop:2, color:'#fca5a5' }}>
              Alasan: {status.rejection_reason}
            </div>
          )}
          {isPending && (
            <div style={{ fontSize:'0.78rem', fontWeight:400, marginTop:2 }}>
              Dokumen sedang diperiksa. Anda tetap dapat login dan menggunakan akun. Penarikan dana akan aktif setelah diverifikasi.
            </div>
          )}
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div style={{ padding:'10px 16px', borderRadius:10, marginBottom:20, fontWeight:600, fontSize:'0.875rem', background: msg.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`, color: msg.type==='success'?'#10b981':'#ef4444' }}>
          <i className={`fa-solid ${msg.type==='success'?'fa-circle-check':'fa-circle-exclamation'}`} style={{ marginRight:8 }} />
          {msg.text}
        </div>
      )}

      {!isVerified && (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* ── KTP Section ────────────────────────────────────────── */}
          <div className='card' style={{ padding:20 }}>
            <h3 style={{ color:'#f7f8ff', fontSize:'1rem', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>
              <i className='fa-solid fa-address-card' style={{ color:'#22d3ee' }} />Foto KTP
            </h3>
            <p style={{ color:'#64748b', fontSize:'0.82rem', margin:'0 0 14px' }}>
              Upload foto KTP yang jelas dan terbaca. Pastikan semua teks terlihat.
            </p>

            {ktpPreview && (
              <div style={{ marginBottom:14 }}>
                <img src={ktpPreview} alt='KTP preview' style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)' }} />
              </div>
            )}

            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <input ref={ktpInputRef} type='file' accept='image/jpeg,image/png,image/webp' style={{ display:'none' }} onChange={onKtpChange} />
              <button
                onClick={() => ktpInputRef.current?.click()}
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8' }}
              >
                <i className='fa-solid fa-upload' />
                {ktpPreview ? 'Ganti Foto KTP' : 'Upload Foto KTP'}
              </button>
            </div>
          </div>

          {/* ── Selfie Section ─────────────────────────────────────── */}
          <div className='card' style={{ padding:20 }}>
            <h3 style={{ color:'#f7f8ff', fontSize:'1rem', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>
              <i className='fa-solid fa-camera' style={{ color:'#22d3ee' }} />Foto Selfie
            </h3>
            <p style={{ color:'#64748b', fontSize:'0.82rem', margin:'0 0 14px' }}>
              Ambil foto selfie sambil memegang KTP agar terlihat jelas. Pastikan wajah dan KTP keduanya terlihat.
            </p>

            {showCamera ? (
              <div style={{ marginBottom:14 }}>
                <CameraCapture
                  onCapture={onSelfieCapture}
                  onClose={() => setShowCamera(false)}
                />
              </div>
            ) : (
              <>
                {selfiePreview && (
                  <div style={{ marginBottom:14 }}>
                    <img src={selfiePreview} alt='Selfie preview' style={{ width:'100%', maxHeight:220, objectFit:'cover', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                )}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {/* Ambil foto dengan kamera */}
                  <button
                    onClick={() => setShowCamera(true)}
                    style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)', color:'#22d3ee' }}
                  >
                    <i className='fa-solid fa-camera' />
                    {selfiePreview ? 'Ambil Ulang Foto' : 'Ambil Foto'}
                  </button>
                  {/* Upload sebagai alternatif */}
                  <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8' }}>
                    <i className='fa-solid fa-upload' />Upload Foto
                    <input type='file' accept='image/jpeg,image/png,image/webp' style={{ display:'none' }} onChange={onSelfieFileChange} />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* ── Submit ─────────────────────────────────────────────── */}
          {!isPending && (
            <button
              onClick={handleSubmit}
              disabled={submitting || (!ktpFile && !ktpUrl) || (!selfieFile && !selfieUrl)}
              style={{ padding:'12px 28px', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:'0.95rem', background:'rgba(34,211,238,0.15)', border:'1px solid rgba(34,211,238,0.3)', color:'#22d3ee', opacity: (submitting || (!ktpFile && !ktpUrl) || (!selfieFile && !selfieUrl)) ? 0.5 : 1 }}
            >
              {submitting
                ? <><i className='fa-solid fa-spinner fa-spin' style={{ marginRight:8 }} />Mengirim...</>
                : <><i className='fa-solid fa-paper-plane' style={{ marginRight:8 }} />Kirim Dokumen</>
              }
            </button>
          )}
        </div>
      )}

      {isVerified && (
        <div className='card' style={{ padding:24, textAlign:'center' }}>
          <i className='fa-solid fa-shield-check' style={{ fontSize:'2.5rem', color:'#10b981', marginBottom:12, display:'block' }} />
          <div style={{ color:'#f7f8ff', fontWeight:700, fontSize:'1.05rem', marginBottom:6 }}>Identitas Terverifikasi</div>
          <p style={{ color:'#64748b', fontSize:'0.875rem', margin:0 }}>
            Identitas Anda telah diverifikasi. Fitur penarikan dana kini tersedia.
          </p>
        </div>
      )}
    </div>
  );
}
