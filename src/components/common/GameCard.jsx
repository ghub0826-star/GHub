import React from 'react';
import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  return (
    <div className='popular-card'>
      <div className='pg-icon'>{game.title.slice(0,3).toUpperCase()}</div>
      <div>
        <strong>{game.title}</strong>
        <div style={{color:'var(--muted)'}}>{game.subtitle}</div>
      </div>
    </div>
  );
}
