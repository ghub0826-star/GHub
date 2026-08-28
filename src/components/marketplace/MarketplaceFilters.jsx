import React, { useState, useEffect } from 'react';

const categories = [
  {label:'Semua', value:'all'},
  {label:'Akun Game', value:'accounts'},
  {label:'Item Game', value:'items'},
  {label:'Top Up', value:'top-up'},
  {label:'Game Currency', value:'currency'},
  {label:'Boosting', value:'boosting'},
  {label:'Gift Card', value:'gift-card'}
];

export default function MarketplaceFilters({ values = {}, onChange, onReset }){
  const [local, setLocal] = useState({
    category: 'all', game: 'all', priceMin:'', priceMax:'', seller:'all', delivery:'all', sort:'new'
  });

  useEffect(()=> setLocal(v=> ({...v, ...values})), [values]);

  const update = (patch) => {
    const next = {...local, ...patch};
    setLocal(next);
    onChange && onChange(next);
  };

  return (
    <div className='marketplace-filters'>
      <div className='filter-row'>
        <label>Category</label>
        <div className='chips'>
          {categories.map(c=> (
            <button key={c.value} className={local.category===c.value? 'active':''} onClick={()=> update({category:c.value})}>{c.label}</button>
          ))}
        </div>
      </div>

    </div>
  );
}
