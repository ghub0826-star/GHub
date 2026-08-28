import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const suggestions = [
  'Valorant Points',
  'Steam Wallet',
  'Apex Legends Account',
  'Free Fire Diamonds',
  'Top Up Mobile Legends',
  'Fortnite Skin',
  'Genshin Impact Primogems',
];

export default function SearchBox() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const doSearch = (ev) => {
    if (ev) ev.preventDefault();
    if (!q || !q.trim()) return;
    navigate(`/marketplace?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={doSearch} className='header-search-form'>
      <input
        list='search-options'
        placeholder='Cari game, item, akun, SKU...'
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label='Cari marketplace'
      />
      <datalist id='search-options'>
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <button className='header-search-btn' type='submit' aria-label='Search'>
        <img src='/assets/magnifier-glass.png' alt='Search' className='navbar-search-icon' />
      </button>
    </form>
  );
}
