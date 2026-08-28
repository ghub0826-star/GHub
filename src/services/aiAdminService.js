import api from './api';

// ============================================================================
// AI Admin Service — admin endpoints for AI platform management.
// Endpoints: overview, providers, models, usage, costs, safety, review queue,
// evaluations, feedback, config. All require ADMIN role.
// ============================================================================

async function get(path, params = {}) {
  const res = await api.get(path, { params });
  return res.data;
}

async function post(path, body = {}) {
  const res = await api.post(path, body);
  return res.data;
}

export async function aiAdminOverview() {
  return get('/ai/admin/overview');
}

export async function aiAdminProviders() {
  return get('/ai/admin/providers');
}

export async function aiAdminModels() {
  return get('/ai/admin/models');
}

export async function aiAdminUsage({ days = 30 } = {}) {
  return get('/ai/admin/usage', { days });
}

export async function aiAdminCosts({ days = 30 } = {}) {
  return get('/ai/admin/costs', { days });
}

export async function aiAdminSafety() {
  return get('/ai/admin/safety');
}

export async function aiAdminReviewQueue({ status = 'OPEN' } = {}) {
  return get('/ai/admin/review-queue', { status });
}

export async function aiAdminResolveReview(id, { resolution = null, status = 'RESOLVED' } = {}) {
  return post(`/ai/admin/review-queue/${id}/resolve`, { resolution, status });
}

export async function aiAdminEvaluations() {
  return get('/ai/admin/evaluations');
}

export async function aiAdminFeedback() {
  return get('/ai/admin/feedback');
}

export async function aiAdminGetConfig() {
  return get('/ai/admin/config');
}

export async function aiAdminUpsertConfig(configData) {
  return post('/ai/admin/config', configData);
}

export async function aiAdminHealth() {
  return get('/ai/admin/health');
}

export default {
  aiAdminOverview,
  aiAdminProviders,
  aiAdminModels,
  aiAdminUsage,
  aiAdminCosts,
  aiAdminSafety,
  aiAdminReviewQueue,
  aiAdminResolveReview,
  aiAdminEvaluations,
  aiAdminFeedback,
  aiAdminGetConfig,
  aiAdminUpsertConfig,
  aiAdminHealth,
};

