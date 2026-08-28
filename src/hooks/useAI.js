import { useCallback, useState } from 'react';
import * as aiService from '../services/aiService';

// ============================================================================
// useAI — hook bundling common AI user-facing actions with loading/error state.
// ============================================================================

export function useAI() {
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
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback((message) => run(() => aiService.aiChat(message)), [run]);
  const search = useCallback((params) => run(() => aiService.aiSearch(params)), [run]);
  const recommend = useCallback((params) => run(() => aiService.aiRecommend(params)), [run]);
  const support = useCallback((question) => run(() => aiService.aiSupport(question)), [run]);
  const sellerAssistant = useCallback((params) => run(() => aiService.aiSellerAssistant(params)), [run]);
  const moderate = useCallback((product) => run(() => aiService.aiModerate(product)), [run]);
  const pricing = useCallback((params) => run(() => aiService.aiPricing(params)), [run]);
  const analytics = useCallback((params) => run(() => aiService.aiAnalytics(params)), [run]);
  const marketing = useCallback((params) => run(() => aiService.aiMarketing(params)), [run]);
  const embedding = useCallback((text) => run(() => aiService.aiEmbedding(text)), [run]);
  const feedback = useCallback((params) => run(() => aiService.aiFeedback(params)), [run]);

  return {
    loading,
    error,
    chat,
    search,
    recommend,
    support,
    sellerAssistant,
    moderate,
    pricing,
    analytics,
    marketing,
    embedding,
    feedback,
  };
}

export default useAI;
