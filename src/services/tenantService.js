import api from './api';

// ---- Public tenant config (resolved via header/domain) ----
export const getTenantConfig = () => api.get('/enterprise/config');

// ---- Tenant CRUD (Super Admin) ----
export const listTenants = (params = {}) => api.get('/enterprise/admin/tenants', { params });
export const createTenant = (data) => api.post('/enterprise/admin/tenants', data);
export const getTenant = (id) => api.get(`/enterprise/admin/tenants/${id}`);
export const updateTenant = (id, data) => api.patch(`/enterprise/admin/tenants/${id}`, data);
export const suspendTenant = (id) => api.post(`/enterprise/admin/tenants/${id}/suspend`);
export const activateTenant = (id) => api.post(`/enterprise/admin/tenants/${id}/activate`);
export const deleteTenant = (id) => api.delete(`/enterprise/admin/tenants/${id}`);
export const cloneTenant = (id, newSlug) => api.post(`/enterprise/admin/tenants/${id}/clone`, { newSlug });
export const backupTenant = (id) => api.post(`/enterprise/admin/tenants/${id}/backup`);
export const restoreTenant = (id, backup) => api.post(`/enterprise/admin/tenants/${id}/restore`, { backup });

// ---- Theme / white label / feature flags ----
export const updateTheme = (id, theme) => api.patch(`/enterprise/admin/tenants/${id}/theme`, theme);
export const updateWhiteLabel = (id, settings) => api.patch(`/enterprise/admin/tenants/${id}/whitelabel`, settings);
export const setFeatureFlag = (id, feature, enabled, config) => api.post(`/enterprise/admin/tenants/${id}/features`, { feature, enabled, config });

// ---- Subscription & billing ----
export const getPlans = () => api.get('/enterprise/admin/plans');
export const updateSubscription = (id, data) => api.patch(`/enterprise/admin/tenants/${id}/subscription`, data);
export const listInvoices = (id) => api.get(`/enterprise/admin/tenants/${id}/invoices`);

// ---- Exchange rates ----
export const listExchangeRates = () => api.get('/enterprise/admin/exchange-rates');
export const updateExchangeRate = (currency, rate, manualOverride) => api.post('/enterprise/admin/exchange-rates', { currency, rate, manualOverride });

// ---- Audit ----
export const getAudit = (params = {}) => api.get('/enterprise/admin/audit', { params });

// ---- Monitoring / observability ----
export const getMonitoring = () => api.get('/enterprise/admin/monitoring');
export const getObservability = () => api.get('/enterprise/admin/observability');

// ---- Backup ----
export const runBackup = () => api.post('/enterprise/admin/backup');
export const listBackups = () => api.get('/enterprise/admin/backup');
export const restoreBackup = (filename) => api.post('/enterprise/admin/backup/restore', { filename });

// ---- CMS ----
export const getCms = (tenantId) => api.get(`/enterprise/admin/cms/${tenantId}`);
export const saveCmsSection = (tenantId, section, data) => api.post(`/enterprise/admin/cms/${tenantId}`, { section, data });

// ---- API Gateway ----
export const issueApiKey = (tenantId) => api.post(`/enterprise/admin/tenants/${tenantId}/apikeys`);
export const listApiKeys = (tenantId) => api.get(`/enterprise/admin/tenants/${tenantId}/apikeys`);

// ---- Tenant Dashboard ----
export const getTenantDashboard = (id) => api.get(`/enterprise/admin/tenants/${id}/dashboard`);

export default {
  getTenantConfig, listTenants, createTenant, getTenant, updateTenant,
  suspendTenant, activateTenant, deleteTenant, cloneTenant, backupTenant, restoreTenant,
  updateTheme, updateWhiteLabel, setFeatureFlag,
  getPlans, updateSubscription, listInvoices,
  listExchangeRates, updateExchangeRate, getAudit,
  getMonitoring, getObservability, runBackup, listBackups, restoreBackup,
  getCms, saveCmsSection, issueApiKey, listApiKeys, getTenantDashboard,
};
