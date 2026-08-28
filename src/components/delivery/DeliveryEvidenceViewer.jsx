import React, { useState } from 'react';

export default function DeliveryEvidenceViewer({ files = [] }) {
  const [activeMedia, setActiveMedia] = useState(null);

  if (!files || files.length === 0) {
    return (
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(26,29,38,0.95), rgba(18,20,28,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        <i className="fa-solid fa-camera-slash" style={{ fontSize: '2rem', color: '#475569', marginBottom: 10 }}></i>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#cbd5e1' }}>Belum Ada Bukti Pengiriman</div>
        <div style={{ fontSize: '0.82rem', marginTop: 4 }}>
          Seller belum mengunggah foto atau video bukti pengiriman untuk pesanan ini.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(26,29,38,0.95), rgba(18,20,28,0.98))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-photo-film" style={{ color: '#06b6d4' }}></i>
            Bukti Pengiriman dari Seller ({files.length})
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Klik pada media untuk melihat screenshot atau rekaman pengiriman ukuran penuh.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
        {files.map((file, idx) => {
          const isVideo = file.file_type === 'VIDEO' || file.mime_type?.startsWith('video/');
          return (
            <div
              key={file.id || idx}
              onClick={() => setActiveMedia(file)}
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.12)',
                aspectRatio: '1',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
            >
              {isVideo ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    color: '#94a3b8',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(56,189,248,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      fontSize: '1.2rem',
                      marginBottom: 6,
                    }}
                  >
                    <i className="fa-solid fa-play"></i>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>Putar Video</span>
                </div>
              ) : (
                <img
                  src={file.file_url}
                  alt={file.file_name || 'Bukti'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  background: isVideo ? 'rgba(14,165,233,0.85)' : 'rgba(16,185,129,0.85)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <i className={isVideo ? 'fa-solid fa-video' : 'fa-solid fa-image'}></i>
                {isVideo ? 'Video' : 'Foto'}
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '6px 8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                  fontSize: '0.72rem',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file.file_name || (isVideo ? 'Video Bukti' : 'Foto Bukti')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Video Modal */}
      {activeMedia && (
        <div
          onClick={() => setActiveMedia(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0f172a',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(15,23,42,0.95)',
              }}
            >
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
                {activeMedia.file_name || 'Bukti Pengiriman'}
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {activeMedia.file_type === 'VIDEO' || activeMedia.mime_type?.startsWith('video/') ? (
                <video
                  src={activeMedia.file_url}
                  controls
                  autoPlay
                  style={{ maxWidth: '80vw', maxHeight: '75vh', borderRadius: 8 }}
                />
              ) : (
                <img
                  src={activeMedia.file_url}
                  alt={activeMedia.file_name}
                  style={{ maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
