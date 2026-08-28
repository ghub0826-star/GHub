import React from 'react';
import formatCurrency from '../../utils/formatCurrency';
import CheckoutGameFields from './CheckoutGameFields';

export default function SellerOrderGroup({ group, gameData, setGameDataForItem, validationItemsMap }) {
  const groupSubtotal = group.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

  return (
    <div className='checkout-card'>
      <div className='seller-group-head'>
        <div
          className='seller-logo'
          style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}
        >
          {(group.sellerName || 'S').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>{group.sellerName}</div>
          <div className='checkout-hint'>Subtotal toko: {formatCurrency(groupSubtotal)}</div>
        </div>
      </div>

      {group.items.map((item, idx) => {
        const lineSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        // Merge backend-validated metadata (authoritative requiredFields, delivery, price)
        const meta = validationItemsMap?.get?.(String(item.id)) || {};
        const requiredFields = meta.requiredFields?.length ? meta.requiredFields : (item.requiredFields || []);
        const deliveryType = meta.deliveryType || item.deliveryType || item.delivery_type;
        const deliveryTime = meta.deliveryTime || item.deliveryTime || item.delivery_time || '-';
        const displayPrice = meta.productPrice != null ? Number(meta.productPrice) : (Number(item.price) || 0);

        return (
          <div key={item.slug + '-' + item.id} className='checkout-product'>
            <div className='co-product-img'>
              <img src={item.image || '/assets/product-1.jpg'} alt={item.title} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/ghub/120/80'; }} />
            </div>
            <div className='co-product-info'>
              <div style={{ fontWeight: 800 }}>{item.title}</div>
              <div className='checkout-hint'>{item.game || ''} • {item.sellerName || group.sellerName || ''}</div>
              {item.options && Object.keys(item.options).length ? (
                <div className='checkout-hint'>
                  {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                </div>
              ) : null}
              <div className='checkout-hint'>Estimasi pengiriman: {deliveryTime}</div>
            </div>
            <div className='co-product-price'>
              <div>{formatCurrency(displayPrice)}</div>
              <div className='checkout-hint'>× {item.quantity}</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>{formatCurrency(displayPrice * (item.quantity || 1))}</div>
            </div>

            {/* Game data fields per unique product in cart */}
            <CheckoutGameFields
              product={{ ...item, requiredFields, deliveryType, deliveryTime }}
              fields={gameData[item.id] || {}}
              onChange={(fields) => setGameDataForItem(item.id, fields)}
            />
          </div>
        );
      })}
    </div>
  );
}
