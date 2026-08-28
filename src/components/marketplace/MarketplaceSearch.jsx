import React, { useState, useEffect } from 'react';

export default function MarketplaceSearch({ initial = '', onSearch }){
  const [q, setQ] = useState(initial || '');
  useEffect(()=> setQ(initial || ''), [initial]);

  const submit = (e) => {
    if (e) e.preventDefault();
    if (!q || !q.trim()) return;
    onSearch(q.trim());
  };

  return (
    <form className='marketplace-search' onSubmit={submit} role='search'>
      <input
        aria-label='Search marketplace'
        placeholder='Cari game, item, akun, atau seller...'
        value={q}
        onChange={(e)=> setQ(e.target.value)}
      />
      <button type='submit' className='button'>Search</button>
    </form>
  );
}
