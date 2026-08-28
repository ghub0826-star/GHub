import { useEffect, useRef, useState } from 'react';
import * as paymentService from '../services/paymentService';

// Poll payment status from backend with a bounded interval (5s, max ~60s).
export default function usePaymentStatus(orderNumber, { enabled = true, intervalMs = 5000, maxAttempts = 12 } = {}) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const attempts = useRef(0);

  useEffect(() => {
    if (!enabled || !orderNumber) return;
    let mounted = true;
    let timer = null;

    const check = async () => {
      if (!mounted) return;
      try {
        const res = await paymentService.getPaymentStatus(orderNumber);
        if (!mounted) return;
        setStatus(res.payment);
        setError(null);
        // Stop when terminal status reached
        if (['PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(res.payment?.paymentStatus)) {
          setDone(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Gagal memeriksa status pembayaran');
      }

      attempts.current += 1;
      if (attempts.current >= maxAttempts) {
        setDone(true);
        setLoading(false);
      } else {
        timer = setTimeout(check, intervalMs);
      }
    };

    check();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderNumber, enabled, intervalMs, maxAttempts]);

  return { status, loading, error, done, setLoading };
}
