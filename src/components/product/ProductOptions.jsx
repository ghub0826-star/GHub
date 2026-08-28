import React from 'react';

export default function ProductOptions({ product, value = {}, onChange }){
  // Minimal: if product has variants object e.g. { nominal: [{label,price}], server: [...] }
  const variants = product.variants || {};

  const handle = (key, val) => onChange && onChange({ ...value, [key]: val });

  return (
    <div className='product-options'>
      {Object.keys(variants).map(k=> (
        <div key={k} className='option-row'>
          <label>{k}</label>
          <select value={value[k]||''} onChange={e=> handle(k, e.target.value)}>
            <option value=''>Pilih {k}</option>
            {variants[k].map(opt=> (
              <option key={opt.value||opt.label} value={opt.value||opt.label}>{opt.label}{opt.price? ` (+${opt.price})` : ''}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
