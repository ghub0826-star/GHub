import React from 'react';

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className='section-title'>
      <div>
        <h2>{title}</h2>
        {subtitle && <div style={{color:'var(--muted)',fontSize:13}}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
