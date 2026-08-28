import React from 'react';
import SellerOrderGroup from './SellerOrderGroup';

export default function CheckoutItems({ sellerGroups, gameData, setGameDataForItem, validationItemsMap }) {
  if (!sellerGroups.length) {
    return (
      <div className='checkout-card'>
        <h3 className='checkout-card-title'>Produk</h3>
        <p className='checkout-hint'>Keranjang masih kosong.</p>
      </div>
    );
  }
  return (
    <div className='checkout-section'>
      <h3 className='checkout-section-title'>Produk</h3>
      <div className='co-seller-groups'>
        {sellerGroups.map((g, i) => (
          <SellerOrderGroup
            key={g.sellerSlug + i}
            group={g}
            gameData={gameData}
            setGameDataForItem={setGameDataForItem}
            validationItemsMap={validationItemsMap}
          />
        ))}
      </div>
    </div>
  );
}

