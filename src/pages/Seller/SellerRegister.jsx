/**
 * SellerRegister.jsx — Multi-step Seller Registration Wizard
 *
 * Step 1 — Informasi Toko & Pemilik
 * Step 2 — Verifikasi KTP  (kamera + upload)
 * Step 3 — Foto Selfie     (kamera dengan deteksi wajah via Canvas)
 * Step 4 — Alamat Lengkap  (negara, provinsi, kota, jalan, kode pos)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as sellerService from '../../services/sellerService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ImageUploadField from '../../components/common/ImageUploadField';
import './SellerRegister.css';
import './SellerRegisterWizard.css';

// ─── validation helpers ───────────────────────────────────────────────────────
const usernamePattern = /^[A-Za-z0-9_.]{3,}$/;
const emailPattern    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern    = /^[0-9+\- ]{6,20}$/;
const slugPattern     = /^[a-z0-9-]+$/;
const slugify = s => String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

// ─── upload helper ────────────────────────────────────────────────────────────
async function uploadFileToStorage(file, folder) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post(`/uploads/image?folder=${folder}`);  // placeholder - fixed below
  return res;
}
async function doUpload(file, folder) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post('/uploads/image', fd, { params: { folder } });
  const url = res.data?.url || res.data?.data?.url;
  if (!url) throw new Error('Upload gagal — coba lagi.');
  return url;
}

// ─── Reusable components ──────────────────────────────────────────────────────
const Field = ({ label, required, error, hint, children }) => (
  <div className='srw-field'>
    {label && (
      <label className='srw-label'>
        {label}{required && <span className='srw-required'>*</span>}
      </label>
    )}
    {children}
    {hint  && !error && <p className='srw-hint'>{hint}</p>}
    {error && <p className='srw-error' role='alert'><i className='fa-solid fa-circle-exclamation' /> {error}</p>}
  </div>
);

const Inp = ({ value, onChange, type='text', placeholder, disabled, ...rest }) => (
  <input
    className='srw-input'
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    {...rest}
  />
);

const Sel = ({ value, onChange, children, disabled }) => (
  <select className='srw-input srw-select' value={value} onChange={onChange} disabled={disabled}>{children}</select>
);

// ─── Step indicator ──────────────────────────────────────────────────────────
const STEPS = [
  { icon: 'fa-store',       label: 'Info Toko'    },
  { icon: 'fa-id-card',     label: 'Verifikasi KTP' },
  { icon: 'fa-camera',      label: 'Selfie'       },
  { icon: 'fa-location-dot',label: 'Alamat'       },
];

function StepBar({ current }) {
  return (
    <div className='srw-stepbar'>
      {STEPS.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <React.Fragment key={i}>
            <div className={`srw-step ${done?'srw-step--done':''} ${active?'srw-step--active':''}`}>
              <div className='srw-step-circle'>
                {done
                  ? <i className='fa-solid fa-check' />
                  : <i className={`fa-solid ${s.icon}`} />
                }
              </div>
              <span className='srw-step-label'>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`srw-step-line ${done?'srw-step-line--done':''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Camera component (reused across steps) ──────────────────────────────────
function CameraView({ onCapture, onClose, facingMode = 'environment', overlayShape = 'rect', label = 'Ambil Foto' }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let live = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
      .then(stream => {
        if (!live) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch(e => setError(
        e.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Silakan izinkan kamera di pengaturan browser.'
          : 'Kamera tidak tersedia di perangkat ini.'
      ));
    return () => {
      live = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  const capture = useCallback(() => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      onCapture(blob, c.toDataURL('image/jpeg', 0.88));
    }, 'image/jpeg', 0.88);
  }, [onCapture]);

  return (
    <div className='srw-camera'>
      {error ? (
        <div className='srw-camera-error'>
          <i className='fa-solid fa-video-slash' />
          <p>{error}</p>
        </div>
      ) : (
        <div className='srw-camera-frame'>
          <video ref={videoRef} autoPlay playsInline muted className={`srw-camera-video ${ready?'srw-camera-video--ready':''}`} />
          {!ready && <div className='srw-camera-loading'><i className='fa-solid fa-spinner fa-spin' /> Memuat kamera…</div>}
          {/* Overlay guide */}
          {ready && (
            <div className={`srw-camera-overlay srw-camera-overlay--${overlayShape}`}>
              <div className='srw-camera-overlay-corner srw-camera-overlay-corner--tl' />
              <div className='srw-camera-overlay-corner srw-camera-overlay-corner--tr' />
              <div className='srw-camera-overlay-corner srw-camera-overlay-corner--bl' />
              <div className='srw-camera-overlay-corner srw-camera-overlay-corner--br' />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display:'none' }} />
        </div>
      )}
      <div className='srw-camera-actions'>
        {ready && !error && (
          <button type='button' className='srw-btn srw-btn--primary' onClick={capture}>
            <i className='fa-solid fa-camera' /> {label}
          </button>
        )}
        <button type='button' className='srw-btn srw-btn--ghost' onClick={onClose}>
          <i className='fa-solid fa-xmark' /> Batal
        </button>
      </div>
    </div>
  );
}

// ─── Step 1 — Info Toko ───────────────────────────────────────────────────────
function Step1({ onNext, initialData }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName:  user?.name || user?.full_name || '',
    username:  user?.username || '',
    email:     user?.email || '',
    whatsapp:  '',
    storeName: '',
    storeSlug: '',
    description: '',
    payoutName: '',
    payoutAccount: '',
    payoutProvider: '',
    ...initialData,
  });
  const [logoUrl,        setLogoUrl]        = useState(initialData?.logoUrl || '');
  const [logoFile,       setLogoFile]       = useState(null);
  const [bannerUrl,      setBannerUrl]      = useState(initialData?.bannerUrl || '');
  const [bannerFile,     setBannerFile]     = useState(null);
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [uploadingBanner,setUploadingBanner]= useState(false);
  const [checkingSlug,   setCheckingSlug]   = useState(false);
  const [agree,          setAgree]          = useState(false);
  const [errors,         setErrors]         = useState({});
  const [busy,           setBusy]           = useState(false);

  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setErrors(p=>({...p,[k]:undefined})); };

  const onLogoChange = async file => {
    setLogoFile(file); setLogoUrl(URL.createObjectURL(file)); setUploadingLogo(true);
    setErrors(p=>({...p,logo:undefined}));
    try {
      const url = await doUpload(file,'seller-logos');
      setLogoUrl(url);
    } catch(e) {
      setErrors(p=>({...p,logo:e?.response?.data?.message||e?.message||'Upload logo gagal.'}));
      setLogoUrl(''); setLogoFile(null);
    } finally { setUploadingLogo(false); }
  };
  const onBannerChange = async file => {
    setBannerFile(file); setBannerUrl(URL.createObjectURL(file)); setUploadingBanner(true);
    setErrors(p=>({...p,banner:undefined}));
    try {
      const url = await doUpload(file,'seller-banners');
      setBannerUrl(url);
    } catch(e) {
      setErrors(p=>({...p,banner:e?.response?.data?.message||e?.message||'Upload banner gagal.'}));
    } finally { setUploadingBanner(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName  = 'Nama lengkap wajib';
    if (!form.whatsapp.trim())  e.whatsapp  = 'Nomor WhatsApp wajib';
    else if (!phonePattern.test(form.whatsapp)) e.whatsapp = 'Format nomor tidak valid';
    if (!form.storeName.trim()||form.storeName.length<3) e.storeName = 'Nama toko minimal 3 karakter';
    if (!form.storeSlug.trim())           e.storeSlug = 'Store slug wajib';
    else if (!slugPattern.test(form.storeSlug)) e.storeSlug = 'Hanya huruf kecil, angka, tanda hubung';
    if (!logoUrl)       e.logo       = 'Logo toko wajib diunggah';
    if (uploadingLogo)  e.logo       = 'Tunggu upload selesai';
    if (uploadingBanner)e.banner     = 'Tunggu upload selesai';
    if (!form.payoutName.trim())    e.payoutName    = 'Nama rekening wajib';
    if (!form.payoutAccount.trim()) e.payoutAccount = 'Nomor rekening wajib';
    if (!form.payoutProvider.trim())e.payoutProvider= 'Nama bank/penyedia wajib';
    if (!agree) e.agree = 'Harus menyetujui syarat & ketentuan';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // Slug uniqueness
    setCheckingSlug(true);
    try {
      const r = await sellerService.checkSlugUnique(form.storeSlug);
      if (r.data?.unique === false) { setErrors(p=>({...p,storeSlug:'Slug sudah dipakai.'})); setCheckingSlug(false); return; }
    } catch {}
    setCheckingSlug(false);
    setBusy(true);
    try {
      await api.post('/seller/applications', {
        ...form,
        logo:   logoUrl  ? { url: logoUrl  } : null,
        banner: bannerUrl ? { url: bannerUrl } : null,
      });
      onNext({ ...form, logoUrl, bannerUrl });
    } catch(err) {
      const msg = err?.response?.data?.message||'Gagal menyimpan. Coba lagi.';
      const status = err?.response?.data?.status;
      if (status === 'APPROVED') { window.location.href = '/seller/dashboard'; return; }
      setErrors({ form: msg });
    } finally { setBusy(false); }
  };

  const anyUploading = uploadingLogo || uploadingBanner;
  const autoSlug = e => {
    set('storeSlug', slugify(e.target.value));
    set('storeName', e.target.value);
  };

  return (
    <form onSubmit={submit} className='srw-step-form'>
      {errors.form && <div className='srw-alert srw-alert--error'><i className='fa-solid fa-circle-exclamation' /> {errors.form}</div>}

      <div className='srw-section'>
        <h3 className='srw-section-title'><i className='fa-solid fa-user' /> Data Pemilik</h3>
        <div className='srw-grid2'>
          <Field label='Nama Lengkap' required error={errors.fullName}>
            <Inp value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder='Nama sesuai KTP' />
          </Field>
          <Field label='Nomor WhatsApp' required error={errors.whatsapp}>
            <Inp value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)} placeholder='08xxxxxxxxxx' type='tel' />
          </Field>
        </div>
      </div>

      <div className='srw-section'>
        <h3 className='srw-section-title'><i className='fa-solid fa-store' /> Data Toko</h3>
        <div className='srw-grid2'>
          <Field label='Nama Toko' required error={errors.storeName}>
            <Inp value={form.storeName} onChange={autoSlug} placeholder='Nama toko kamu' />
          </Field>
          <Field label='Store Slug' required error={errors.storeSlug} hint='Digunakan sebagai URL toko: ghub.id/seller/slug'>
            <Inp value={form.storeSlug} onChange={e=>set('storeSlug',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder='nama-toko' />
          </Field>
        </div>
        <Field label='Deskripsi Toko' error={errors.description} hint='Opsional — ceritakan tentang toko kamu'>
          <textarea className='srw-input srw-textarea' value={form.description} onChange={e=>set('description',e.target.value)} placeholder='Toko game terpercaya sejak...' rows={3} />
        </Field>

        <div className='srw-upload-row'>
          <ImageUploadField
            label='Logo Toko (maks 2 MB)' required accept='image/*' maxMB={2}
            previewShape='square' hint='Avatar toko di marketplace'
            previewUrl={logoUrl} uploading={uploadingLogo} error={errors.logo}
            onChange={onLogoChange} onRemove={()=>{setLogoFile(null);setLogoUrl('');}}
            disabled={anyUploading} uploadLabel='Upload Logo'
          />
          <div className='srw-upload-banner'>
            <ImageUploadField
              label='Banner Toko (maks 5 MB)' accept='image/*' maxMB={5}
              previewShape='wide' hint='Ditampilkan di halaman profil toko'
              previewUrl={bannerUrl} uploading={uploadingBanner} error={errors.banner}
              onChange={onBannerChange} onRemove={()=>{setBannerFile(null);setBannerUrl('');}}
              disabled={anyUploading} uploadLabel='Upload Banner'
            />
          </div>
        </div>
      </div>

      <div className='srw-section'>
        <h3 className='srw-section-title'><i className='fa-solid fa-building-columns' /> Data Pencairan Dana</h3>
        <div className='srw-grid3'>
          <Field label='Nama Pemilik Rekening' required error={errors.payoutName}>
            <Inp value={form.payoutName} onChange={e=>set('payoutName',e.target.value)} placeholder='Sesuai buku tabungan' />
          </Field>
          <Field label='Nomor Rekening / Akun' required error={errors.payoutAccount}>
            <Inp value={form.payoutAccount} onChange={e=>set('payoutAccount',e.target.value)} placeholder='0812345678' />
          </Field>
          <Field label='Bank / Penyedia' required error={errors.payoutProvider}>
            <Sel value={form.payoutProvider} onChange={e=>set('payoutProvider',e.target.value)}>
              <option value=''>-- Pilih --</option>
              {['BCA','BNI','BRI','Mandiri','CIMB Niaga','Permata','BSI','Bank Jago','OVO','GoPay','Dana','ShopeePay','QRIS'].map(b=>(
                <option key={b} value={b}>{b}</option>
              ))}
            </Sel>
          </Field>
        </div>
      </div>

      <div className='srw-agree'>
        <label className='srw-agree-label'>
          <input type='checkbox' checked={agree} onChange={e=>setAgree(e.target.checked)} className='srw-agree-check' />
          <span>
            Saya menyetujui <Link to='/seller-agreement' target='_blank' className='srw-link'>Perjanjian Seller</Link> dan{' '}
            <Link to='/terms' target='_blank' className='srw-link'>Syarat & Ketentuan</Link> GHub Marketplace.
          </span>
        </label>
        {errors.agree && <p className='srw-error'><i className='fa-solid fa-circle-exclamation' /> {errors.agree}</p>}
      </div>

      <div className='srw-footer'>
        <span className='srw-footer-note'>
          <i className='fa-solid fa-shield-check' style={{color:'#22d3ee',marginRight:6}} />
          Data kamu aman dan terenkripsi
        </span>
        <button type='submit' className='srw-btn srw-btn--primary srw-btn--lg' disabled={busy||anyUploading}>
          {busy || checkingSlug
            ? <><i className='fa-solid fa-spinner fa-spin' /> Menyimpan…</>
            : <>Lanjut ke Verifikasi KTP <i className='fa-solid fa-arrow-right' /></>
          }
        </button>
      </div>
    </form>
  );
}

// ─── Step 2 — Verifikasi KTP ─────────────────────────────────────────────────
function Step2({ onNext, onBack }) {
  const [mode,        setMode]        = useState('idle');   // idle | camera | preview
  const [ktpBlob,     setKtpBlob]     = useState(null);
  const [ktpPreview,  setKtpPreview]  = useState(null);
  const [ktpUrl,      setKtpUrl]      = useState(null);
  const [ktpNumber,   setKtpNumber]   = useState('');
  const [fullName,    setFullName]     = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState(null);
  const fileRef = useRef(null);

  const onCapture = useCallback((blob, dataUrl) => {
    setKtpBlob(blob); setKtpPreview(dataUrl); setKtpUrl(null); setMode('preview'); setError(null);
  }, []);

  const onFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    if (file.size > 5*1024*1024)         { setError('Ukuran maksimal 5 MB.'); return; }
    setKtpBlob(file); setKtpPreview(URL.createObjectURL(file)); setKtpUrl(null); setMode('preview'); setError(null);
  };

  const submit = async () => {
    if (!ktpBlob && !ktpUrl) { setError('Foto KTP wajib diambil atau diunggah.'); return; }
    setUploading(true); setError(null);
    try {
      const url = ktpUrl || await doUpload(
        ktpBlob instanceof Blob ? new File([ktpBlob],'ktp.jpg',{type:'image/jpeg'}) : ktpBlob,
        'kyc/ktp'
      );
      setKtpUrl(url);
      await api.patch('/seller/applications/ktp', { ktp_url: url, ktp_number: ktpNumber||null, identity_full_name: fullName||null });
      onNext({ ktpUrl: url, ktpNumber, fullName });
    } catch(e) {
      setError(e?.response?.data?.message || e?.message || 'Upload gagal. Coba lagi.');
    } finally { setUploading(false); }
  };

  return (
    <div className='srw-step-form'>
      <div className='srw-kyc-intro'>
        <i className='fa-solid fa-id-card srw-kyc-icon' />
        <div>
          <h4>Verifikasi Kartu Tanda Penduduk</h4>
          <p>Ambil foto KTP yang jelas menggunakan kamera atau upload file. Pastikan semua teks terbaca.</p>
        </div>
      </div>

      {error && <div className='srw-alert srw-alert--error'><i className='fa-solid fa-circle-exclamation' /> {error}</div>}

      {mode === 'camera' ? (
        <CameraView
          onCapture={onCapture}
          onClose={()=>setMode('idle')}
          facingMode='environment'
          overlayShape='rect'
          label='Ambil Foto KTP'
        />
      ) : mode === 'preview' ? (
        <div className='srw-kyc-preview'>
          <div className='srw-kyc-preview-img-wrap'>
            <img src={ktpPreview} alt='Preview KTP' className='srw-kyc-preview-img' />
            <div className='srw-kyc-preview-badge'>
              <i className='fa-solid fa-check-circle' /> Foto KTP
            </div>
          </div>
          <div className='srw-kyc-preview-retake'>
            <button type='button' className='srw-btn srw-btn--outline' onClick={()=>{ setMode('idle'); setKtpBlob(null); setKtpPreview(null); setKtpUrl(null); }}>
              <i className='fa-solid fa-rotate-left' /> Ambil Ulang
            </button>
          </div>
        </div>
      ) : (
        <div className='srw-kyc-methods'>
          <button type='button' className='srw-kyc-method-btn' onClick={()=>setMode('camera')}>
            <div className='srw-kyc-method-icon'><i className='fa-solid fa-camera' /></div>
            <div>
              <div className='srw-kyc-method-title'>Ambil Foto dengan Kamera</div>
              <div className='srw-kyc-method-sub'>Gunakan kamera perangkat — disarankan</div>
            </div>
            <i className='fa-solid fa-chevron-right srw-kyc-method-arrow' />
          </button>
          <button type='button' className='srw-kyc-method-btn' onClick={()=>fileRef.current?.click()}>
            <div className='srw-kyc-method-icon'><i className='fa-solid fa-upload' /></div>
            <div>
              <div className='srw-kyc-method-title'>Upload File</div>
              <div className='srw-kyc-method-sub'>JPG, PNG, WEBP — maks 5 MB</div>
            </div>
            <i className='fa-solid fa-chevron-right srw-kyc-method-arrow' />
          </button>
          <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' style={{display:'none'}} onChange={onFileChange} />
        </div>
      )}

      {/* Optional fields */}
      {mode === 'preview' && (
        <div className='srw-kyc-extra'>
          <div className='srw-grid2'>
            <Field label='Nomor KTP (16 digit)' hint='Opsional — mempercepat verifikasi'>
              <Inp value={ktpNumber} onChange={e=>setKtpNumber(e.target.value.replace(/\D/g,'').slice(0,16))} placeholder='3271xxxxxxxxxxxxxxxx' maxLength={16} />
            </Field>
            <Field label='Nama di KTP' hint='Opsional — harus sama dengan KTP'>
              <Inp value={fullName} onChange={e=>setFullName(e.target.value)} placeholder='Nama lengkap sesuai KTP' />
            </Field>
          </div>
        </div>
      )}

      <div className='srw-footer'>
        <button type='button' className='srw-btn srw-btn--ghost' onClick={onBack}>
          <i className='fa-solid fa-arrow-left' /> Kembali
        </button>
        <button type='button' className='srw-btn srw-btn--primary srw-btn--lg'
          onClick={submit} disabled={uploading || !ktpBlob && !ktpUrl}>
          {uploading
            ? <><i className='fa-solid fa-spinner fa-spin' /> Mengunggah…</>
            : <>Lanjut ke Foto Selfie <i className='fa-solid fa-arrow-right' /></>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 — Selfie (face detection via browser API) ─────────────────────────
function Step3({ onNext, onBack }) {
  const [mode,          setMode]          = useState('idle');
  const [selfieBlob,    setSelfieBlob]    = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieUrl,     setSelfieUrl]     = useState(null);
  const [faceStatus,    setFaceStatus]    = useState(null);  // null | 'detecting' | 'detected' | 'no-face'
  const [uploading,     setUploading]     = useState(false);
  const [error,         setError]         = useState(null);
  const fileRef        = useRef(null);
  const detectionTimer = useRef(null);

  // Face detection using browser canvas + skin-tone heuristic
  // (Native approach — no external library needed)
  const detectFace = useCallback(async (dataUrl) => {
    setFaceStatus('detecting');
    try {
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });
      const canvas = document.createElement('canvas');
      canvas.width  = Math.min(img.width,  320);
      canvas.height = Math.min(img.height, 320);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Count skin-tone pixels (YCbCr range heuristic)
      let skinPixels = 0, total = canvas.width * canvas.height;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        // Convert to YCbCr
        const y  = 0.257*r + 0.504*g + 0.098*b + 16;
        const cb = -0.148*r - 0.291*g + 0.439*b + 128;
        const cr = 0.439*r - 0.368*g - 0.071*b + 128;
        if (y>80 && cb>=77 && cb<=127 && cr>=133 && cr<=173) skinPixels++;
      }
      const ratio = skinPixels / total;
      // Threshold: at least 3% skin pixels suggests a face is present
      setFaceStatus(ratio > 0.03 ? 'detected' : 'no-face');
    } catch {
      setFaceStatus('detected'); // fail open
    }
  }, []);

  const onCapture = useCallback((blob, dataUrl) => {
    setSelfieBlob(blob);
    setSelfiePreview(dataUrl);
    setSelfieUrl(null);
    setMode('preview');
    setError(null);
    detectFace(dataUrl);
  }, [detectFace]);

  const onFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    if (file.size > 5*1024*1024)         { setError('Ukuran maksimal 5 MB.'); return; }
    const url = URL.createObjectURL(file);
    setSelfieBlob(file); setSelfiePreview(url); setSelfieUrl(null); setMode('preview'); setError(null);
    detectFace(url);
  };

  const reset = () => { setSelfieBlob(null); setSelfiePreview(null); setSelfieUrl(null); setMode('idle'); setFaceStatus(null); setError(null); };

  const submit = async () => {
    if (!selfieBlob && !selfieUrl) { setError('Foto selfie wajib diambil.'); return; }
    setUploading(true); setError(null);
    try {
      const url = selfieUrl || await doUpload(
        selfieBlob instanceof Blob ? new File([selfieBlob],'selfie.jpg',{type:'image/jpeg'}) : selfieBlob,
        'kyc/selfie'
      );
      setSelfieUrl(url);
      await api.patch('/seller/applications/selfie', { selfie_url: url });
      onNext({ selfieUrl: url });
    } catch(e) {
      setError(e?.response?.data?.message || e?.message || 'Upload gagal. Coba lagi.');
    } finally { setUploading(false); }
  };

  const canProceed = (selfieBlob || selfieUrl) && faceStatus !== 'detecting';

  return (
    <div className='srw-step-form'>
      <div className='srw-kyc-intro'>
        <i className='fa-solid fa-face-smile srw-kyc-icon srw-kyc-icon--selfie' />
        <div>
          <h4>Foto Selfie dengan KTP</h4>
          <p>Ambil selfie sambil memegang KTP. Pastikan wajah dan foto di KTP sama-sama terlihat jelas.</p>
        </div>
      </div>

      {error && <div className='srw-alert srw-alert--error'><i className='fa-solid fa-circle-exclamation' /> {error}</div>}

      {mode === 'camera' ? (
        <CameraView
          onCapture={onCapture}
          onClose={()=>setMode('idle')}
          facingMode='user'
          overlayShape='oval'
          label='Ambil Selfie'
        />
      ) : mode === 'preview' ? (
        <div className='srw-selfie-preview'>
          <div className='srw-selfie-img-wrap'>
            <img src={selfiePreview} alt='Selfie preview' className='srw-selfie-img' />
            {/* Face detection status overlay */}
            <div className={`srw-selfie-badge srw-selfie-badge--${faceStatus||'detecting'}`}>
              {faceStatus === 'detecting' && <><i className='fa-solid fa-spinner fa-spin' /> Memeriksa wajah…</>}
              {faceStatus === 'detected'  && <><i className='fa-solid fa-face-smile-beam' /> Wajah terdeteksi</>}
              {faceStatus === 'no-face'   && <><i className='fa-solid fa-face-frown' /> Wajah tidak jelas</>}
            </div>
          </div>
          {faceStatus === 'no-face' && (
            <div className='srw-alert srw-alert--warning'>
              <i className='fa-solid fa-triangle-exclamation' /> Wajah tidak terdeteksi dengan jelas.
              Pastikan wajah menghadap kamera dan pencahayaan cukup. Kamu tetap bisa melanjutkan.
            </div>
          )}
          <div className='srw-kyc-preview-retake'>
            <button type='button' className='srw-btn srw-btn--outline' onClick={reset}>
              <i className='fa-solid fa-rotate-left' /> Ambil Ulang
            </button>
          </div>
        </div>
      ) : (
        <div className='srw-kyc-methods'>
          <button type='button' className='srw-kyc-method-btn' onClick={()=>setMode('camera')}>
            <div className='srw-kyc-method-icon srw-kyc-method-icon--cam'><i className='fa-solid fa-camera' /></div>
            <div>
              <div className='srw-kyc-method-title'>Ambil Selfie</div>
              <div className='srw-kyc-method-sub'>Kamera depan — deteksi wajah otomatis</div>
            </div>
            <i className='fa-solid fa-chevron-right srw-kyc-method-arrow' />
          </button>
          <button type='button' className='srw-kyc-method-btn' onClick={()=>fileRef.current?.click()}>
            <div className='srw-kyc-method-icon'><i className='fa-solid fa-upload' /></div>
            <div>
              <div className='srw-kyc-method-title'>Upload Foto</div>
              <div className='srw-kyc-method-sub'>JPG, PNG, WEBP — maks 5 MB</div>
            </div>
            <i className='fa-solid fa-chevron-right srw-kyc-method-arrow' />
          </button>
          <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' style={{display:'none'}} onChange={onFileChange} />
        </div>
      )}

      {/* Tips */}
      <div className='srw-tips'>
        <div className='srw-tips-title'><i className='fa-solid fa-lightbulb' /> Tips foto selfie yang baik</div>
        <ul className='srw-tips-list'>
          <li>Hadapkan wajah langsung ke kamera</li>
          <li>Pegang KTP di samping wajah agar keduanya terlihat</li>
          <li>Pastikan pencahayaan cukup terang</li>
          <li>Hindari foto yang buram atau gelap</li>
        </ul>
      </div>

      <div className='srw-footer'>
        <button type='button' className='srw-btn srw-btn--ghost' onClick={onBack}>
          <i className='fa-solid fa-arrow-left' /> Kembali
        </button>
        <button type='button' className='srw-btn srw-btn--primary srw-btn--lg'
          onClick={submit} disabled={uploading || !canProceed}>
          {uploading
            ? <><i className='fa-solid fa-spinner fa-spin' /> Mengunggah…</>
            : <>Lanjut ke Alamat <i className='fa-solid fa-arrow-right' /></>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Alamat Lengkap ─────────────────────────────────────────────────
const COUNTRIES = [
  'Indonesia','Malaysia','Singapura','Filipina','Thailand','Vietnam','Brunei Darussalam',
  'Timor Leste','Kamboja','Myanmar','Laos',
];

const PROVINCES_ID = [
  'Aceh','Bali','Banten','Bengkulu','DI Yogyakarta','DKI Jakarta','Gorontalo',
  'Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat','Kalimantan Selatan',
  'Kalimantan Tengah','Kalimantan Timur','Kalimantan Utara','Kepulauan Bangka Belitung',
  'Kepulauan Riau','Lampung','Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur',
  'Papua','Papua Barat','Papua Barat Daya','Papua Pegunungan','Papua Selatan','Papua Tengah',
  'Riau','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tengah','Sulawesi Tenggara','Sulawesi Utara',
  'Sumatera Barat','Sumatera Selatan','Sumatera Utara',
];

function Step4({ onSubmit: onFinish, onBack }) {
  const [form, setForm] = useState({ country:'Indonesia', province:'', city:'', street:'', postal_code:'' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!form.country.trim())  e.country  = 'Pilih negara';
    if (!form.province.trim()) e.province = 'Provinsi / wilayah wajib diisi';
    if (!form.city.trim())     e.city     = 'Kota / kabupaten wajib diisi';
    if (!form.street.trim())   e.street   = 'Alamat jalan wajib diisi';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    try {
      const res = await api.patch('/seller/applications/address', form);
      if (res.data?.success) {
        onFinish();
      } else {
        setErrors({ form: res.data?.message || 'Gagal menyimpan. Coba lagi.' });
      }
    } catch(err) {
      setErrors({ form: err?.response?.data?.message||'Gagal menyimpan. Coba lagi.' });
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className='srw-step-form'>
      <div className='srw-kyc-intro'>
        <i className='fa-solid fa-location-dot srw-kyc-icon srw-kyc-icon--addr' />
        <div>
          <h4>Alamat Lengkap</h4>
          <p>Alamat digunakan untuk keperluan verifikasi dan pengiriman dokumen jika diperlukan.</p>
        </div>
      </div>

      {errors.form && <div className='srw-alert srw-alert--error'><i className='fa-solid fa-circle-exclamation' /> {errors.form}</div>}

      <div className='srw-section'>
        <div className='srw-grid2'>
          <Field label='Negara' required error={errors.country}>
            <Sel value={form.country} onChange={e=>set('country',e.target.value)}>
              {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label='Provinsi / Wilayah' required error={errors.province}>
            {form.country === 'Indonesia' ? (
              <Sel value={form.province} onChange={e=>set('province',e.target.value)}>
                <option value=''>-- Pilih Provinsi --</option>
                {PROVINCES_ID.map(p=><option key={p} value={p}>{p}</option>)}
              </Sel>
            ) : (
              <Inp value={form.province} onChange={e=>set('province',e.target.value)} placeholder='Nama provinsi / wilayah' />
            )}
          </Field>
        </div>

        <div className='srw-grid2'>
          <Field label='Kota / Kabupaten' required error={errors.city}>
            <Inp value={form.city} onChange={e=>set('city',e.target.value)} placeholder='Nama kota' />
          </Field>
          <Field label='Kode Pos' error={errors.postal_code} hint='Opsional'>
            <Inp value={form.postal_code} onChange={e=>set('postal_code',e.target.value.replace(/\D/g,'').slice(0,6))} placeholder='12345' maxLength={6} />
          </Field>
        </div>

        <Field label='Alamat Jalan' required error={errors.street} hint='Nama jalan, nomor, RT/RW, kelurahan'>
          <textarea className='srw-input srw-textarea' value={form.street} onChange={e=>set('street',e.target.value)}
            placeholder='Jl. Sudirman No. 123, RT 01/RW 05, Kel. Karet, Kec. Setiabudi' rows={3} />
        </Field>
      </div>

      {/* Preview alamat */}
      {form.street && form.city && (
        <div className='srw-addr-preview'>
          <div className='srw-addr-preview-title'><i className='fa-solid fa-map-pin' /> Ringkasan Alamat</div>
          <div className='srw-addr-preview-text'>
            {[form.street, form.city, form.province, form.postal_code, form.country]
              .filter(Boolean).join(', ')}
          </div>
        </div>
      )}

      <div className='srw-footer'>
        <button type='button' className='srw-btn srw-btn--ghost' onClick={onBack}>
          <i className='fa-solid fa-arrow-left' /> Kembali
        </button>
        <button type='submit' className='srw-btn srw-btn--primary srw-btn--lg' disabled={busy}>
          {busy
            ? <><i className='fa-solid fa-spinner fa-spin' /> Mengirim…</>
            : <><i className='fa-solid fa-paper-plane' /> Kirim Pendaftaran</>
          }
        </button>
      </div>
    </form>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
  const navigate  = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refresh auth context so role menjadi SELLER setelah backend upgrade
    const init = async () => {
      try { await refreshUser(); } catch {}
      // Redirect langsung ke seller dashboard
      navigate('/seller/dashboard', { replace: true });
    };
    const t = setTimeout(init, 1500);
    return () => clearTimeout(t);
  }, [navigate, refreshUser]);

  return (
    <div className='srw-success'>
      <div className='srw-success-icon'><i className='fa-solid fa-circle-check' /></div>
      <h3>Pendaftaran Berhasil!</h3>
      <p>Akun seller kamu sudah aktif. Kamu bisa langsung mulai berjualan.</p>
      <p className='srw-success-sub' style={{ marginTop: 8, color: '#f59e0b' }}>
        <i className='fa-solid fa-id-card' style={{ marginRight: 6 }} />
        Verifikasi KTP diperlukan untuk mengaktifkan pencairan dana.
      </p>
      <p className='srw-success-sub'>Mengalihkan ke dashboard seller…</p>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function SellerRegister() {
  const [step,      setStep]     = useState(0);
  const [stepData,  setStepData] = useState({});

  const nextStep = data => { setStepData(p=>({...p,...data})); setStep(s=>s+1); window.scrollTo({top:0,behavior:'smooth'}); };
  const prevStep = ()     => { setStep(s=>Math.max(0,s-1)); window.scrollTo({top:0,behavior:'smooth'}); };
  const finish   = ()     => { setStep(4); };

  return (
    <div className='seller-register-page-wrapper'>
      <Header />
      <div className='srw-container'>
        <div className='srw-card'>
          {/* Card top bar */}
          <div className='srw-card-bar' />

          {/* Header */}
          {step < 4 && (
            <div className='srw-header'>
              <div className='srw-header-logo'>
                <img src='/assets/logo.jpg' alt='GHub' />
              </div>
              <div>
                <h2 className='srw-title'>Mulai Berjualan di GHub</h2>
                <p className='srw-subtitle'>Lengkapi semua langkah untuk mengaktifkan toko kamu</p>
              </div>
            </div>
          )}

          {/* Step bar */}
          {step < 4 && <StepBar current={step} />}

          {/* Step content */}
          {step === 0 && <Step1 onNext={nextStep} initialData={stepData} />}
          {step === 1 && <Step2 onNext={nextStep} onBack={prevStep} />}
          {step === 2 && <Step3 onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <Step4 onSubmit={finish}  onBack={prevStep} />}
          {step === 4 && <SuccessScreen />}
        </div>
      </div>
    </div>
  );
}
