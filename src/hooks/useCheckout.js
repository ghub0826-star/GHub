import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as checkoutService from '../services/checkoutService';
import generateIdempotencyKey from '../utils/generateIdempotencyKey';

// Group cart items by seller for multi-seller checkout
export function groupBySeller(cart) {
  const map = new Map();
  for (const item of cart) {
    const key = item.sellerSlug || item.sellerName || 'seller';
    if (!map.has(key)) {
      map.set(key, {
        sellerName: item.sellerName || 'Seller',
        sellerSlug: item.sellerSlug || '',
        items: [],
      });
    }
    map.get(key).items.push(item);
  }
  return [...map.values()];
}

export function useCheckout() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user } = useAuth();

  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameData, setGameData] = useState({}); // { [productId]: { key: value } }

  // Group items for display
  const sellerGroups = useMemo(() => groupBySeller(cart), [cart]);

  const itemsPayload = useMemo(
    () => cart.map((it) => ({ productId: it.id, variantId: it.variantId || null, quantity: it.quantity })),
    [cart]
  );

  const runValidation = useCallback(async () => {
    if (!cart.length) return;
    setValidating(true);
    setValidationError(null);
    try {
      const res = await checkoutService.validateCheckout({
        items: itemsPayload,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
      });
      if (res.success) {
        setValidation(res.checkout);
      } else {
        setValidation(null);
        setValidationError(res.message || 'Validasi gagal');
      }
    } catch (e) {
      setValidation(null);
      setValidationError(e?.response?.data?.message || 'Gagal memvalidasi checkout');
    } finally {
      setValidating(false);
    }
  }, [cart.length, itemsPayload, appliedVoucher]);

  // Merge backend-validated item metadata (requiredFields) with cart items
  // so game-data fields render correctly for all products.
  const validationItemsMap = useMemo(() => {
    const map = new Map();
    (validation?.items || []).forEach((vItem) => {
      map.set(String(vItem.productId), {
        requiredFields: vItem.requiredFields || [],
        deliveryType: vItem.deliveryType || vItem.delivery_type || '',
        category: vItem.gameCategory || '',
        deliveryTime: vItem.deliveryTime || vItem.delivery_time || '',
        productPrice: vItem.productPrice,
      });
    });
    return map;
  }, [validation]);

  // Auto-validate when cart, voucher, or items change (debounced by consumer)
  useEffect(() => {
    if (cart.length) runValidation();
    else {
      setValidation(null);
      setValidationError(null);
    }
    // Re-run when payload/voucher changes intentionally
    // eslint-disable-next-line
  }, [itemsPayload, appliedVoucher]);

  const applyVoucher = useCallback((code) => {
    setAppliedVoucher({ code: String(code || '').trim().toUpperCase() });
  }, []);

  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherCode('');
  }, []);

  const submitOrder = useCallback(async () => {
    if (!cart.length || !validation || submitting) return null;
    setSubmitting(true);
    try {
      const idempotencyKey = generateIdempotencyKey();
      const res = await checkoutService.createOrder({
        items: cart.map((it) => ({
          productId: it.id,
          variantId: it.variantId || null,
          quantity: it.quantity,
          gameData: gameData[it.id] || {},
          options: it.options || null,
        })),
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        paymentMethod,
        idempotencyKey,
      });
      if (res.success) {
        return res; // returns orderNumber + redirectUrl
      }
      return { success: false, message: res.message };
    } catch (e) {
      return { success: false, message: e?.response?.data?.message || 'Gagal membuat pesanan' };
    } finally {
      setSubmitting(false);
    }
  }, [cart, validation, submitting, gameData, appliedVoucher, paymentMethod]);

  return {
    cart,
    user,
    sellerGroups,
    validation,
    validating,
    validationError,
    validationItemsMap,
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    paymentMethod,
    setPaymentMethod,
    agree,
    setAgree,
    submitting,
    submitOrder,
    gameData,
    setGameData,
    navigate,
  };
}
