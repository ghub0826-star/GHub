import api from './api';

// ============================================================================
// AI Service — authenticated endpoints for AI features (user-facing).
// All helpers call POST /api/ai/* and return the `{ ok, data }` body.
// ============================================================================

async function run(method, url, body = {}) {
  const res = await api[method](url, body);
  return res.data;
}

// Chat with GHub AI assistant. Body: { message }
export async function aiChat(message) {
  return run('post', '/ai/chat', { message });
}

// Semantic search. Body: { query, filters?, page?, limit? }
export async function aiSearch({ query, filters = {}, page = 1, limit = 20 }) {
  return run('post', '/ai/search', { query, filters, page, limit });
}

// Recommendations. Body: { type?, productId?, limit? }
export async function aiRecommend({ type = 'personalized', productId = null, limit = 10 } = {}) {
  return run('post', '/ai/recommend', { type, productId, limit });
}

// Self-serve support. Body: { question }
export async function aiSupport(question) {
  return run('post', '/ai/support', { question });
}

// Seller assistant. Body: { action, input }
export async function aiSellerAssistant({ action, input }) {
  return run('post', '/ai/seller-assistant', { action, input });
}

// Product moderation. Body: { title?, description?, category?, imageUrl?, productId? }
export async function aiModerate(product) {
  return run('post', '/ai/moderate', product);
}

// Pricing suggestion. Body: { productId?, category? }
export async function aiPricing({ productId = null, category = null } = {}) {
  return run('post', '/ai/pricing', { productId, category });
}

// Admin: analytics. Body: { metric, args? }
export async function aiAnalytics({ metric, args = {} } = {}) {
  return run('post', '/ai/analytics', { metric, args });
}

// Admin: marketing content. Body: { type, input }
export async function aiMarketing({ type, input }) {
  return run('post', '/ai/marketing', { type, input });
}

// Embedding. Body: { text }
export async function aiEmbedding(text) {
  return run('post', '/ai/embedding', { text });
}

// Feedback. Body: { requestId, rating?, reportReason?, comment? }
export async function aiFeedback({ requestId, rating = null, reportReason = null, comment = null } = {}) {
  return run('post', '/ai/feedback', { requestId, rating, reportReason, comment });
}

export default {
  aiChat,
  aiSearch,
  aiRecommend,
  aiSupport,
  aiSellerAssistant,
  aiModerate,
  aiPricing,
  aiAnalytics,
  aiMarketing,
  aiEmbedding,
  aiFeedback,
};

