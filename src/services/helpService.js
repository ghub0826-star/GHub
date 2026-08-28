import api from './api';

export async function listCategories() {
  const res = await api.get('/help/categories');
  return res.data.categories || [];
}

export async function listArticles({ categoryId, search } = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.set('categoryId', categoryId);
  if (search) params.set('search', search);
  const qs = params.toString();
  const res = await api.get(`/help/articles${qs ? `?${qs}` : ''}`);
  return res.data.articles || [];
}

export async function getArticle(slug) {
  const res = await api.get(`/help/articles/${slug}`);
  return res.data.article || null;
}

export async function getPopularArticles(limit = 6) {
  const res = await api.get(`/help/articles/popular?limit=${limit}`);
  return res.data.articles || [];
}

export async function recordFeedback(articleId, helpful) {
  const res = await api.post(`/help/articles/${articleId}/feedback`, { helpful });
  return res.data;
}
