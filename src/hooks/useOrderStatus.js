import { useState, useCallback } from 'react';
import * as orderService from '../services/orderService';
import * as fulfillmentService from '../services/orderFulfillmentService';

// Hook to fetch an order and manage its status transitions client-side.
// The actual status change is always done through the backend which validates transitions.
export default function useOrderStatus(orderNumber) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrder(orderNumber);
      setOrder(res.order);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  const sellerStart = useCallback(async (subOrderId) => {
    setActionLoading(true);
    try {
      const res = await fulfillmentService.sellerStartProcessing(subOrderId);
      await reload();
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.message || 'Gagal memproses pesanan');
    } finally {
      setActionLoading(false);
    }
  }, [reload]);

  const sellerDeliver = useCallback(async (subOrderId, deliveryType, payload) => {
    setActionLoading(true);
    try {
      const res = await fulfillmentService.sellerDeliver(subOrderId, { deliveryType, payload });
      await reload();
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.message || 'Gagal mengirim pesanan');
    } finally {
      setActionLoading(false);
    }
  }, [reload]);

  const buyerComplete = useCallback(async (orderId) => {
    setActionLoading(true);
    try {
      const res = await fulfillmentService.buyerComplete(orderId);
      await reload();
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.message || 'Gagal menyelesaikan pesanan');
    } finally {
      setActionLoading(false);
    }
  }, [reload]);

  return {
    order,
    loading,
    error,
    actionLoading,
    reload,
    sellerStart,
    sellerDeliver,
    buyerComplete,
  };
}
