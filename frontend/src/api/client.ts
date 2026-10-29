import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // send HttpOnly cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor: redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; display_name: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

// ── Reports ───────────────────────────────────────────────────────────────
export const reportsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/api/reports', { params }),
  get: (id: string) =>
    api.get(`/api/reports/${id}`),
  create: (data: Record<string, any>) =>
    api.post('/api/reports', data),
  analyze: (id: string) =>
    api.post(`/api/reports/${id}/analyze`),
  review: (id: string, data: { status: string; review_note?: string }) =>
    api.post(`/api/reports/${id}/review`, data),
  dispute: (id: string, reason: string) =>
    api.post(`/api/reports/${id}/disputes`, { reason }),
  uploadEvidence: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/reports/${id}/evidence`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  verify: (id: string) =>
    api.post(`/api/reports/${id}/verify`),
  getBlockchainRecords: (id: string) =>
    api.get(`/api/reports/${id}/blockchain`),
};

// ── Investigations ────────────────────────────────────────────────────────
export const investigationsApi = {
  graph: (params?: Record<string, any>) =>
    api.get('/api/investigations/graph', { params }),
  auditEvents: (params?: Record<string, any>) =>
    api.get('/api/investigations/audit-events', { params }),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  listUsers: (params?: Record<string, any>) =>
    api.get('/api/admin/users', { params }),
  updateUser: (id: string, data: Record<string, any>) =>
    api.patch(`/api/admin/users/${id}`, data),
  stats: () => api.get('/api/admin/stats'),
};

// ── Public ────────────────────────────────────────────────────────────────
export const publicApi = {
  stats: () => api.get('/api/stats'),
  health: () => api.get('/health/live'),
};
