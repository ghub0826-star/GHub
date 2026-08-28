/**
 * ImageUploadField
 * Komponen upload foto yang konsisten di seluruh aplikasi.
 *
 * Props:
 *   label         string   — teks label
 *   required      bool     — tampilkan bintang wajib
 *   accept        string   — MIME types (default "image/*")
 *   maxMB         number   — batas ukuran dalam MB (default 5)
 *   previewShape  "square" | "wide" | "circle"  — bentuk preview
 *   hint          string   — teks petunjuk di bawah tombol
 *   previewUrl    string   — URL yang sedang ditampilkan (controlled)
 *   uploading     bool     — sedang mengupload (tampilkan spinner)
 *   error         string   — pesan error
 *   onChange      fn(file) — dipanggil saat file dipilih
 *   onRemove      fn()     — dipanggil saat tombol hapus diklik
 *   disabled      bool
 *   uploadLabel   string   — label pada tombol (default "Pilih Foto")
 */
import React, { useRef } from 'react';
import './ImageUploadField.css';

export default function ImageUploadField({
  label,
  required = false,
  accept = 'image/*',
  maxMB = 5,
  previewShape = 'square',
  hint,
  previewUrl = '',
  uploading = false,
  error = '',
  onChange,
  onRemove,
  disabled = false,
  uploadLabel = 'Pilih Foto',
}) {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onChange) onChange(file);
    // reset supaya onChange terpanggil lagi jika user pilih file yang sama
    e.target.value = '';
  };

  const triggerInput = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerInput(); }
  };

  const hasPreview = Boolean(previewUrl);

  return (
    <div className='iuf-root'>
      {label && (
        <label className='iuf-label'>
          {label}
          {required && <span className='iuf-required' aria-label='wajib'> *</span>}
        </label>
      )}

      {/* ── Preview area ── */}
      {hasPreview ? (
        <div className={`iuf-preview iuf-preview--${previewShape}`}>
          <img
            src={previewUrl}
            alt='Preview foto'
            className='iuf-preview-img'
            draggable={false}
          />

          {/* Overlay saat uploading */}
          {uploading && (
            <div className='iuf-preview-overlay'>
              <span className='iuf-spinner' aria-hidden='true' />
              <span className='iuf-overlay-text'>Mengunggah…</span>
            </div>
          )}

          {/* Tombol hapus (muncul saat hover, selalu tampil di mobile) */}
          {!uploading && (
            <div className='iuf-preview-actions'>
              <button
                type='button'
                className='iuf-btn-change'
                onClick={triggerInput}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-label='Ganti foto'
                title='Ganti foto'
              >
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/>
                  <polyline points='17 8 12 3 7 8'/>
                  <line x1='12' y1='3' x2='12' y2='15'/>
                </svg>
                Ganti
              </button>
              {onRemove && (
                <button
                  type='button'
                  className='iuf-btn-remove'
                  onClick={onRemove}
                  disabled={disabled}
                  aria-label='Hapus foto'
                  title='Hapus foto'
                >
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                    <polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M10 11v6'/><path d='M14 11v6'/><path d='M9 6V4h6v2'/>
                  </svg>
                  Hapus
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── Drop zone (belum ada gambar) ── */
        <div
          className={`iuf-dropzone iuf-dropzone--${previewShape}${uploading ? ' iuf-dropzone--uploading' : ''}${disabled ? ' iuf-dropzone--disabled' : ''}`}
          onClick={triggerInput}
          onKeyDown={handleKeyDown}
          role='button'
          tabIndex={disabled || uploading ? -1 : 0}
          aria-label={`${uploadLabel}${required ? ' (wajib)' : ''}`}
        >
          {uploading ? (
            <>
              <span className='iuf-spinner' aria-hidden='true' />
              <span className='iuf-dz-text'>Mengunggah…</span>
            </>
          ) : (
            <>
              {/* Ikon upload */}
              <svg className='iuf-dz-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <rect x='3' y='3' width='18' height='18' rx='4'/>
                <circle cx='8.5' cy='8.5' r='1.5'/>
                <polyline points='21 15 16 10 5 21'/>
              </svg>
              <span className='iuf-dz-label'>{uploadLabel}</span>
              {hint && <span className='iuf-dz-hint'>{hint}</span>}
              {maxMB && <span className='iuf-dz-meta'>Maks. {maxMB} MB</span>}
            </>
          )}
        </div>
      )}

      {/* Info meta di bawah preview */}
      {hasPreview && hint && !uploading && (
        <p className='iuf-hint'>{hint}</p>
      )}

      {/* Error */}
      {error && <p className='iuf-error' role='alert'>{error}</p>}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className='iuf-hidden-input'
        aria-hidden='true'
        tabIndex={-1}
      />
    </div>
  );
}
