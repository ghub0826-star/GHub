import { useState, useCallback } from 'react';
import * as fulfillmentService from '../services/orderFulfillmentService';

// Hook to manage dispute fetching, messaging, and admin actions.
export default function useDispute(disputeId) {
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fulfillmentService.getDispute(disputeId);
      setDispute(res.data.dispute);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat dispute');
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  const sendMessage = useCallback(async (message) => {
    setActionLoading(true);
    try {
      const res = await fulfillmentService.postDisputeMessage(disputeId, message);
      await reload();
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setActionLoading(false);
    }
  }, [disputeId, reload]);

  const adminResolve = useCallback(async (decision, reason, refundAmount) => {
    setActionLoading(true);
    try {
      const res = await fulfillmentService.adminResolveDispute(disputeId, { decision, reason, refundAmount });
      await reload();
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.message || 'Gagal menyelesaikan dispute');
    } finally {
      setActionLoading(false);
    }
  }, [disputeId, reload]);

  return {
    dispute,
    loading,
    error,
    actionLoading,
    reload,
    sendMessage,
    adminResolve,
  };
}
