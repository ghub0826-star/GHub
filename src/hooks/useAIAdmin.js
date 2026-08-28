import { useCallback, useState } from 'react';
import * as aiAdminService from '../services/aiAdminService';

// ============================================================================
// useAIAdmin — hook bundling admin AI management actions with state.
// ============================================================================

export function useAIAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      if (res && res.ok === false) {
        setError(res.error || 'AI_ERROR');
        return null;
      }
      return res && res.data !== undefined ? res.data : res;
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Terjadi kesalahan.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const overview = useCallback(() => run(() => aiAdminService.aiAdminOverview()), [run]);
  const listProviders = useCallback(() => run(() => aiAdminService.aiAdminProviders()), [run]);
  const listModels = useCallback(() => run(() => aiAdminService.aiAdminModels()), [run]);
  const usage = useCallback((days = 30) => run(() => aiAdminService.aiAdminUsage({ days })), [run]);
  const costs = useCallback((days = 30) => run(() => aiAdminService.aiAdminCosts({ days })), [run]);
  const safety = useCallback(() => run(() => aiAdminService.aiAdminSafety()), [run]);
  const reviewQueue = useCallback((status = 'OPEN') => run(() => aiAdminService.aiAdminReviewQueue({ status })), [run]);
  const resolveReview = useCallback((id, opts) => run(() => aiAdminService.aiAdminResolveReview(id, opts)), [run]);
  const evaluations = useCallback(() => run(() => aiAdminService.aiAdminEvaluations()), [run]);
  const feedback = useCallback(() => run(() => aiAdminService.aiAdminFeedback()), [run]);
  const getConfig = useCallback(() => run(() => aiAdminService.aiAdminGetConfig()), [run]);
  const upsertConfig = useCallback((data) => run(() => aiAdminService.aiAdminUpsertConfig(data)), [run]);
  const healthCheck = useCallback(() => run(() => aiAdminService.aiAdminHealth()), [run]);

  return {
    loading,
    error,
    overview,
    listProviders,
    listModels,
    usage,
    costs,
    safety,
    reviewQueue,
    resolveReview,
    evaluations,
    feedback,
    getConfig,
    upsertConfig,
    healthCheck,
  };
}

export default useAIAdmin;
