import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cyber_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const orgId = localStorage.getItem('cyber_active_org');
    if (orgId) {
      config.headers['X-Organization-ID'] = orgId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 unauthorized
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/signup' && path !== '/demo') {
        localStorage.removeItem('cyber_token');
        localStorage.removeItem('cyber_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service modules
export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  googleLogin: (payload) => api.post('/auth/google', typeof payload === 'string' ? { token: payload } : payload),
  requestElevation: (data) => api.post('/auth/request-elevation', data),
};

export const orgAPI = {
  list: () => api.get('/organizations/'),
  get: (id) => api.get(`/organizations/${id}`),
};

export const onboardingAPI = {
  submit: (data) => api.post('/onboarding/submit', data),
};

export const assetsAPI = {
  list: (params) => api.get('/assets/', { params }),
  listEndpoints: (params) => api.get('/assets/endpoints', { params }),
  listApplications: (params) => api.get('/assets/applications', { params }),
  create: (data) => api.post('/assets/', data),
};

export const vulnerabilitiesAPI = {
  list: (params) => api.get('/vulnerabilities/', { params }),
  get: (id) => api.get(`/vulnerabilities/${id}`),
  remediate: (id) => api.post(`/vulnerabilities/${id}/remediate`),
  reset: () => api.post('/vulnerabilities/reset'),
};

export const telemetryAPI = {
  getSIEM: (params) => api.get('/telemetry/siem', { params }),
  getEDR: (params) => api.get('/telemetry/edr', { params }),
  getPAM: (params) => api.get('/telemetry/pam', { params }),
  getMitreStats: () => api.get('/telemetry/mitre-stats'),
};

export const simulationsAPI = {
  list: (params) => api.get('/simulations/', { params }),
  get: (id) => api.get(`/simulations/${id}`),
  create: (data) => api.post('/simulations/execute', data),
  getScenarios: () => api.get('/simulations/scenarios/list'),
  getLatestIncident: () => api.get('/simulations/latest-incident'),
  acknowledgeIncident: (simId) => api.post(`/simulations/acknowledge-incident/${simId}`),
};

export const riskAPI = {
  getMetrics: (params) => api.get('/risk/metrics', { params }),
  getLossBreakdown: (currency = 'USD') => api.get('/risk/loss-breakdown', { params: { currency } }),
  getMonteCarlo: (simId, iterations = 10000, currency = 'USD') =>
    api.get(simId ? `/risk/monte-carlo/${simId}` : '/risk/monte-carlo', { params: { iterations, currency } }),
  predictML: (data) => api.post('/risk/ml-predict', data),
};

export const investmentsAPI = {
  getControls: () => api.get('/investments/controls'),
  optimize: (data) => api.post('/investments/optimize', data),
};

export const auditAPI = {
  getReports: (params) => api.get('/audit/reports', { params }),
  generateReport: (data) => api.post('/audit/reports/generate', data),
  verifyHash: (data) => api.post('/audit/verify-hash', typeof data === 'string' ? { sha256_hash: data, hash_sha256: data } : {
    sha256_hash: data.sha256_hash || data.hash_sha256 || '',
    hash_sha256: data.hash_sha256 || data.sha256_hash || '',
    result_id: data.result_id,
  }),
  getAnchors: (params) => api.get('/audit/blockchain-anchors', { params }),
  getNotifications: () => api.get('/audit/notifications'),
  markNotificationRead: (id) => api.put(`/audit/notifications/${id}/read`),
};

// Hyperledger Fabric API endpoints
export const fabricAPI = {
  getStatus: () => api.get('/blockchain/status'),
  getAllRisks: () => api.get(`/blockchain/risks?t=${Date.now()}`),
  submitRisk: (data) => api.post('/blockchain/risk', data)
};

export const marketAPI = {
  getBenchmarks: (industry) => api.get('/market/benchmarks', { params: { industry } }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats').catch(() => api.get('/admin/metrics')),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getOrganizations: (params) => api.get('/admin/organizations', { params }),
  updatePlan: (orgId, planTier) => api.put(`/admin/organizations/${orgId}/plan`, { plan_tier: planTier }),
  getDemoRequests: (params) => api.get('/admin/demo-requests', { params }),
  updateDemoStatus: (id, status) => api.put(`/admin/demo-requests/${id}/status`, { status }),
};

export const demoAPI = {
  requestDemo: (data) => api.post('/demo/request', data),
};

export default api;

