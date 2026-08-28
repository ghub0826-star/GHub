import React from 'react';

export default function Pagination({ page, total, perPage=12, onChange }){
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = [];
  for(let i=1;i<=totalPages;i++) pages.push(i);

  return (
    <div className='pagination'>
      <button disabled={page<=1} onClick={()=> onChange(page-1)}>Previous</button>
      {pages.map(p=> (
        <button key={p} className={p===page? 'active':''} onClick={()=> onChange(p)}>{p}</button>
      ))}
      <button disabled={page>=totalPages} onClick={()=> onChange(page+1)}>Next</button>
    </div>
  );
}
