import api from './api';

// Validate checkout - backend recalculates all totals. Frontend never sends price/sellerId.
export async function validateCheckout({ items, voucherCode }) {
  const res = await api.post('/checkout/validate', {
    items: items.map((it) => ({
      productId: it.productId || it.id,
      variantId: it.variantId || null,
      quantity: it.quantity,
    })),
    voucherCode: voucherCode || null,
  });
  return res.data;
}

export async function createOrder({ items, voucherCode, paymentMethod, idempotencyKey }) {
  const res = await api.post('/orders', {
    items: items.map((it) => ({
      productId: it.productId || it.id,
      variantId: it.variantId || null,
      quantity: it.quantity,
      gameData: it.gameData || {},
      options: it.options || null,
    })),
    voucherCode: voucherCode || null,
    paymentMethod,
    idempotencyKey,
  });
  return res.data;
}

export default { validateCheckout, createOrder };
