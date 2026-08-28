import api from './api';

// Aggregated enterprise admin service (thin wrapper over /enterprise admin endpoints)
const enterpriseService = {
  // Dashboard
  getDashboard: (tenantId) => api.get(`/enterprise/admin/tenants/${tenantId}/dashboard`),

  // Monitoring / observability
  getMonitoring: () => api.get('/enterprise/admin/monitoring'),
  getObservability: () => api.get('/enterprise/admin/observability'),

  // Backup & restore
  runBackup: () => api.post('/enterprise/admin/backup'),
  listBackups: () => api.get('/enterprise/admin/backup'),
  restoreBackup: (filename) => api.post('/enterprise/admin/backup/restore', { filename }),

  // Audit
  getAudit: (params = {}) => api.get('/enterprise/admin/audit', { params }),

  // Plans
  getPlans: () => api.get('/enterprise/admin/plans'),
};

export default enterpriseService;
