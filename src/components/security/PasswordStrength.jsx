import React from 'react';

function scorePassword(password) {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
}

const LABELS = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat', 'Sempurna'];
const COLORS = ['#ff4d4d', '#ff8a00', '#ffd000', '#3ddc84', '#00c8a0', '#00c8a0'];

export default function PasswordStrength({ password }) {
  const score = scorePassword(password);
  const pct = (score / 5) * 100;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: COLORS[score], transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 12, marginTop: 4, color: COLORS[score] }}>{label(password)}</div>
    </div>
  );

  function label(p) {
    if (!p) return 'Password belum diisi';
    return LABELS[score];
  }
}
