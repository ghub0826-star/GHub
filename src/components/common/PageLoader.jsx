import React from 'react';

export default function PageLoader({ label = 'Memuat...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 16,
        color: 'var(--muted)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="spinner"
        style={{
          width: 42,
          height: 42,
          border: '3px solid rgba(255,255,255,0.08)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'ghub-spin 0.8s linear infinite',
        }}
      />
      <div>{label}</div>
    </div>
  );
}
