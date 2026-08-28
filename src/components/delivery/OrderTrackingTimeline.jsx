import React from 'react';

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    return null;
  }
}

export default function OrderTrackingTimeline({ timeline, currentStatus }) {
  if (!timeline) return null;

  const milestones = timeline.milestones || [];
  const durations = timeline.durations || {};

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-route" style={{ color: '#6366f1' }}></i>
            Timeline & Perjalanan Pengiriman
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Pelacakan status akurat berdasarkan pencatatan waktu server real-time
          </p>
        </div>
        {durations.totalFormatted && (
          <div
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fa-solid fa-clock"></i>
            Total: {durations.totalFormatted}
          </div>
        )}
      </div>

      {/* Durations Overview Badge Strip */}
      {(durations.responseFormatted || durations.shippingFormatted || durations.confirmationFormatted) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 24,
            padding: 14,
            background: 'rgba(15,23,42,0.6)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {durations.responseFormatted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(59,130,246,0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <i className="fa-solid fa-stopwatch"></i>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Respon Seller</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{durations.responseFormatted}</div>
              </div>
            </div>
          )}

          {durations.shippingFormatted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(234,179,8,0.15)',
                  color: '#facc15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <i className="fa-solid fa-truck-ramp-box"></i>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Durasi Pengiriman</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{durations.shippingFormatted}</div>
              </div>
            </div>
          )}

          {durations.confirmationFormatted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(34,197,94,0.15)',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Konfirmasi Buyer</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{durations.confirmationFormatted}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stepper Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {milestones.map((item, idx) => {
          const isLast = idx === milestones.length - 1;
          const formattedTime = formatDate(item.timestamp);
          const isDone = item.completed;
          const isActive = item.active;

          let badgeBg = 'rgba(100,116,139,0.15)';
          let badgeBorder = 'rgba(100,116,139,0.3)';
          let iconColor = '#64748b';

          if (isDone) {
            badgeBg = 'rgba(34,197,94,0.15)';
            badgeBorder = 'rgba(34,197,94,0.4)';
            iconColor = '#4ade80';
          } else if (isActive) {
            badgeBg = 'rgba(99,102,241,0.2)';
            badgeBorder = '#6366f1';
            iconColor = '#818cf8';
          }

          return (
            <div key={item.id || idx} style={{ display: 'flex', gap: 16, position: 'relative' }}>
              {/* Timeline Line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: badgeBg,
                    border: `2px solid ${badgeBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: iconColor,
                    fontSize: '1rem',
                    zIndex: 2,
                    boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <i className={isDone ? 'fa-solid fa-check' : item.icon}></i>
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: 2,
                      flexGrow: 1,
                      minHeight: 48,
                      background: isDone
                        ? 'linear-gradient(180deg, rgba(34,197,94,0.6), rgba(34,197,94,0.2))'
                        : 'rgba(255,255,255,0.08)',
                      margin: '4px 0',
                    }}
                  />
                )}
              </div>

              {/* Timeline Content */}
              <div style={{ flexGrow: 1, paddingBottom: isLast ? 0 : 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.98rem',
                        color: isDone || isActive ? '#f8fafc' : '#64748b',
                      }}
                    >
                      {item.title}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(99,102,241,0.2)',
                          color: '#818cf8',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontWeight: 600,
                          border: '1px solid rgba(99,102,241,0.4)',
                        }}
                      >
                        Sedang Berlangsung
                      </span>
                    )}
                  </div>
                  {formattedTime ? (
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                      <i className="fa-regular fa-clock" style={{ marginRight: 5, fontSize: '0.75rem' }}></i>
                      {formattedTime}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                      Menunggu proses
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                  {item.description}
                </div>

                {item.durationFormatted && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: '0.78rem',
                      color: '#a5b4fc',
                      background: 'rgba(99,102,241,0.08)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <i className="fa-solid fa-hourglass-half"></i>
                    {item.durationFormatted}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
