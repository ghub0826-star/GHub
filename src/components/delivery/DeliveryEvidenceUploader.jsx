import React, { useState, useRef } from 'react';
import * as fulfillmentService from '../../services/orderFulfillmentService';

const MAX_SIZE_MB = 50;
const ALLOWED_MIME = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
];

/** Menit:detik dari byte size */
function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * LocalPreviewItem — preview foto/video sebelum upload selesai.
 */
function LocalPreviewItem({ item, onCancel }) {
  const isVideo = item.file.type.startsWith('video/');
  return (
    <div style={styles.tile}>
      {isVideo ? (
        <div style={styles.videoPlaceholder}>
          <i className='fa-solid fa-video' style={{ fontSize: '1.6rem', color: '#38bdf8' }} />
          <span style={styles.tileCaption}>Video</span>
        </div>
      ) : (
        <img
          src={item.previewUrl}
          alt={item.file.name}
          style={styles.tileImg}
          draggable={false}
        />
      )}

      {/* Progress overlay */}
      <div style={styles.progressOverlay}>
        {item.uploading ? (
          <>
            <span style={styles.spinnerInline} />
            <span style={styles.progressLabel}>Mengunggah…</span>
          </>
        ) : item.error ? (
          <span style={{ fontSize: '0.72rem', color: '#f87171', textAlign: 'center', padding: '0 4px' }}>
            {item.error}
          </span>
        ) : null}
      </div>

      {/* Cancel / error dismiss */}
      {!item.uploading && (
        <button
          type='button'
          onClick={() => onCancel(item.id)}
          title='Batalkan'
          style={styles.deleteBtnRed}
        >
          <i className='fa-solid fa-xmark' style={{ fontSize: '0.7rem' }} />
        </button>
      )}

      {/* Nama file */}
      <div style={styles.tileFooter}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.file.name}
        </span>
        <span style={{ color: '#64748b', flexShrink: 0, marginLeft: 4 }}>{fmtSize(item.file.size)}</span>
      </div>
    </div>
  );
}

export default function DeliveryEvidenceUploader({ orderId, files = [], onFilesUpdated }) {
  const [error, setError]           = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // localItems: array of { id, file, previewUrl, uploading, error }
  const [localItems, setLocalItems] = useState([]);
  const fileInputRef = useRef(null);

  const updateLocalItem = (id, patch) =>
    setLocalItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));

  const removeLocalItem = (id) =>
    setLocalItems(prev => {
      const it = prev.find(x => x.id === id);
      if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
      return prev.filter(x => x.id !== id);
    });

  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setError(null);

    // Validate
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran file melebihi batas maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!ALLOWED_MIME.includes(selectedFile.type)) {
      setError('Format tidak didukung. Harap upload JPG / PNG / WEBP atau MP4 / WEBM.');
      return;
    }

    // Buat local preview item
    const id = `local-${Date.now()}-${Math.random()}`;
    const previewUrl = selectedFile.type.startsWith('image/')
      ? URL.createObjectURL(selectedFile)
      : null;

    setLocalItems(prev => [...prev, { id, file: selectedFile, previewUrl, uploading: true, error: null }]);

    try {
      const res = await fulfillmentService.uploadDeliveryEvidence(orderId, selectedFile);
      if (res.data?.success) {
        // Upload sukses — hapus local item, reload daftar dari server
        removeLocalItem(id);
        if (onFilesUpdated) onFilesUpdated();
      } else {
        updateLocalItem(id, { uploading: false, error: 'Upload gagal' });
      }
    } catch (e) {
      updateLocalItem(id, {
        uploading: false,
        error: e.response?.data?.message || 'Gagal mengunggah. Coba lagi.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Hapus bukti pengiriman ini?')) return;
    try {
      await fulfillmentService.deleteDeliveryEvidence(fileId);
      if (onFilesUpdated) onFilesUpdated();
    } catch {
      alert('Gagal menghapus file');
    }
  };

  const totalCount = files.length + localItems.filter(it => it.uploading).length;

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>
            <i className='fa-solid fa-camera-retro' style={{ color: '#10b981' }} />
            Bukti Pengiriman
          </h3>
          <p style={styles.subtitle}>
            Screenshot atau video sebagai jaminan transaksi.
          </p>
        </div>
        <span style={styles.countBadge}>{totalCount} Terlampir</span>
      </div>

      {/* Error global */}
      {error && (
        <div style={styles.errorBar}>
          <i className='fa-solid fa-circle-exclamation' />
          {error}
        </div>
      )}

      {/* ── Zona upload ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          ...styles.dropzone,
          borderColor: isDragOver ? '#6366f1' : 'rgba(255,255,255,0.14)',
          background: isDragOver ? 'rgba(99,102,241,0.09)' : 'rgba(15,23,42,0.45)',
        }}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
        aria-label='Klik atau seret foto/video untuk diunggah'
      >
        <input
          type='file'
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          accept='image/jpeg,image/png,image/webp,video/mp4,video/webm'
          style={{ display: 'none' }}
        />
        <div style={styles.dzIconWrap}>
          <i className='fa-solid fa-cloud-arrow-up' style={{ fontSize: '1.3rem' }} />
        </div>
        <div>
          <span style={styles.dzPrimary}>Klik untuk upload</span>
          <span style={styles.dzSecondary}> atau seret foto / video ke sini</span>
        </div>
        <div style={styles.dzMeta}>
          JPG · PNG · WEBP · MP4 · WEBM — maks. {MAX_SIZE_MB} MB
        </div>
      </div>

      {/* ── Preview lokal (sedang/gagal upload) ── */}
      {localItems.length > 0 && (
        <div>
          <p style={styles.sectionLabel}>Sedang diunggah</p>
          <div style={styles.gallery}>
            {localItems.map(item => (
              <LocalPreviewItem
                key={item.id}
                item={item}
                onCancel={removeLocalItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Gallery file yang sudah tersimpan ── */}
      {files.length > 0 && (
        <div>
          <p style={styles.sectionLabel}>Bukti tersimpan</p>
          <div style={styles.gallery}>
            {files.map((file) => {
              const isVideo = file.file_type === 'VIDEO' || file.mime_type?.startsWith('video/');
              return (
                <div key={file.id} style={styles.tile}>
                  {isVideo ? (
                    <div style={styles.videoPlaceholder}>
                      <i className='fa-solid fa-video' style={{ fontSize: '1.8rem', color: '#38bdf8' }} />
                      <span style={styles.tileCaption}>Video</span>
                    </div>
                  ) : (
                    <img
                      src={file.file_url}
                      alt={file.file_name || 'Bukti'}
                      style={styles.tileImg}
                      loading='lazy'
                    />
                  )}

                  {/* Delete */}
                  <button
                    type='button'
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                    title='Hapus Bukti'
                    style={styles.deleteBtnRed}
                  >
                    <i className='fa-solid fa-trash' style={{ fontSize: '0.65rem' }} />
                  </button>

                  {/* Nama file */}
                  <div style={styles.tileFooter}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.file_name || (isVideo ? 'Video' : 'Foto')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles object (konsisten dengan dark theme GHub) ── */
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: 'linear-gradient(145deg, rgba(26,29,38,0.96), rgba(18,20,28,0.98))',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: '1.05rem',
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '0.83rem',
    color: '#94a3b8',
  },
  countBadge: {
    flexShrink: 0,
    background: 'rgba(16,185,129,0.12)',
    color: '#34d399',
    border: '1px solid rgba(16,185,129,0.25)',
    fontSize: '0.76rem',
    padding: '3px 10px',
    borderRadius: 20,
    fontWeight: 700,
  },
  errorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(239,68,68,0.11)',
    border: '1px solid rgba(239,68,68,0.28)',
    color: '#f87171',
    padding: '9px 14px',
    borderRadius: 10,
    fontSize: '0.84rem',
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    border: '2px dashed',
    borderRadius: 12,
    padding: '22px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    outline: 'none',
  },
  dzIconWrap: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(99,102,241,0.14)',
    color: '#818cf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dzPrimary: {
    fontWeight: 700,
    color: '#f8fafc',
    fontSize: '0.92rem',
  },
  dzSecondary: {
    color: '#94a3b8',
    fontSize: '0.88rem',
  },
  dzMeta: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  sectionLabel: {
    margin: '0 0 8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 10,
  },
  tile: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.09)',
    aspectRatio: '1',
    boxShadow: '0 3px 10px rgba(0,0,0,0.28)',
  },
  tileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: '#020617',
    color: '#94a3b8',
  },
  tileCaption: {
    fontSize: '0.7rem',
    color: '#cbd5e1',
  },
  tileFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '3px 6px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.82), transparent)',
    fontSize: '0.68rem',
    color: '#e2e8f0',
    minHeight: 24,
  },
  progressOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: 'rgba(0,0,0,0.58)',
    backdropFilter: 'blur(3px)',
  },
  spinnerInline: {
    display: 'inline-block',
    width: 20,
    height: 20,
    border: '2.5px solid rgba(99,102,241,0.3)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'iuf-spin 0.7s linear infinite',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: '#e2e8f0',
    fontWeight: 600,
  },
  deleteBtnRed: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.85)',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
  },
};
