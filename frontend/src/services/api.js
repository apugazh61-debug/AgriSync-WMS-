import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
};

// Users
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Warehouses
export const warehouseAPI = {
  getAll: () => api.get('/warehouses'),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

// Products
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  search: (q) => api.get(`/products/search?q=${q}`),
  bulkUpload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/products/bulk-upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Suppliers
export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Inventory
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getByProduct: (productId) => api.get(`/inventory/${productId}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  update: (data) => api.put('/inventory/update', data),
};

// Inbound
export const inboundAPI = {
  getAll: () => api.get('/inbound'),
  getById: (id) => api.get(`/inbound/${id}`),
  create: (data) => api.post('/inbound', data),
};

// Orders
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Stock Movements
export const movementAPI = {
  getAll: () => api.get('/stock-movements'),
  getByProduct: (productId) => api.get(`/stock-movements/${productId}`),
};

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getInventoryChart: () => api.get('/dashboard/inventory-chart'),
  getOrderStats: () => api.get('/dashboard/order-stats'),
};

// Prediction
export const predictionAPI = {
  getDemand: (productId) => api.get(`/prediction/demand/${productId}`),
};

// IoT Telemetry
export const iotAPI = {
  getLatest: () => api.get('/iot/latest'),
  getByWarehouse: (whId) => api.get(`/iot/warehouse/${whId}`),
  simulate: () => api.post('/iot/simulate'),
};

// Batch & FEFO Expiry
export const batchAPI = {
  getAll: () => api.get('/batches'),
  getByProduct: (productId) => api.get(`/batches/product/${productId}`),
  getExpiringSoon: () => api.get('/batches/expiring-soon'),
  getFefoAllocation: (productId, qty = 100) => api.get(`/batches/fefo-allocation?productId=${productId}&quantity=${qty}`),
  executeFefoDispatch: (data) => api.post('/batches/fefo-dispatch', data),
  create: (data) => api.post('/batches', data),
  delete: (id) => api.delete(`/batches/${id}`),
};

// Purchase Orders (Auto-Replenishment)
export const poAPI = {
  getAll: () => api.get('/purchase-orders'),
  autoEvaluate: () => api.post('/purchase-orders/auto-evaluate'),
  approve: (id, approvedBy) => api.put(`/purchase-orders/${id}/approve?approvedBy=${encodeURIComponent(approvedBy || 'Admin Sentinel')}`),
};

// Gate Pass & QR Logistics
export const gatePassAPI = {
  getAll: () => api.get('/gate-pass'),
  issue: (data) => api.post('/gate-pass/issue', data),
  authorizeExit: (passNumber) => api.put(`/gate-pass/${passNumber}/authorize-exit`),
};

// Warehouse Zones
export const zoneAPI = {
  getAll: () => api.get('/zones'),
  getByWarehouse: (whId) => api.get(`/zones/warehouse/${whId}`),
  create: (data) => api.post('/zones', data),
};

// Reports
export const reportAPI = {
  downloadStockAuditCsv: () => api.get('/reports/stock-audit/csv', { responseType: 'blob' }),
};

// Admin Commands
export const adminAPI = {
  seed: () => api.get('/admin/seed'),
};
