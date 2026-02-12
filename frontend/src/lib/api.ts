import axios from 'axios';

// API Base URL - Uses relative path for both local and production
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const resolveImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Get host from API_URL (e.g. http://localhost:4000)
    // We remove /api and any trailing slash
    const host = API_URL.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${host}${cleanPath}`;
};

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authApi = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
    logout: () => api.post('/auth/logout'),
};

// Product APIs
export const productApi = {
    getAll: (params?: any) => api.get('/products', { params }),
    getById: (id: string) => api.get(`/products/${id}`),
    search: (q: string) => api.get('/products/search', { params: { q } }),
    create: (data: any) => api.post('/products', data),
    update: (id: string, data: any) => api.patch(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
    getLowStock: () => api.get('/products/low-stock'),
    uploadImage: (formData: FormData) => api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

// Serial Item APIs
export const serialApi = {
    getAll: (params?: any) => api.get('/serial-items', { params }),
    getByImei: (imei: string) => api.get(`/serial-items/imei/${imei}`),
    checkWarranty: (imei: string) => api.get(`/serial-items/warranty/${imei}`),
    create: (data: any) => api.post('/serial-items', data),
    bulkCreate: (productId: string, items: any[]) =>
        api.post('/serial-items/bulk', { product_id: productId, items }),
    update: (id: string, data: any) => api.patch(`/serial-items/${id}`, data),
};

// Sale APIs
export const saleApi = {
    getAll: (params?: any) => api.get('/sales', { params }),
    getById: (id: string) => api.get(`/sales/${id}`),
    create: (data: any) => api.post('/sales', data),
    void: (id: string) => api.post(`/sales/${id}/void`),
};

// Exchange Rate APIs
export const exchangeRateApi = {
    getToday: () => api.get('/exchange-rate'),
    setToday: (usd_to_khr: number) => api.post('/exchange-rate', { usd_to_khr }),
    getHistory: (days?: number) => api.get('/exchange-rate/history', { params: { days } }),
};

// Report APIs
export const reportApi = {
    getDaily: (date?: string) => api.get('/reports/daily', { params: { date } }),
    getProfit: (start_date: string, end_date: string) =>
        api.get('/reports/profit', { params: { start_date, end_date } }),
    getTopSelling: (days?: number, limit?: number) =>
        api.get('/reports/top-selling', { params: { days, limit } }),
    getStaffPerformance: (start_date?: string, end_date?: string) =>
        api.get('/reports/staff-performance', { params: { start_date, end_date } }),
};

// Category & Brand APIs
export const categoryApi = {
    getAll: () => api.get('/categories'),
    create: (data: any) => api.post('/categories', data),
    update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

export const brandApi = {
    getAll: () => api.get('/brands'),
    create: (data: any) => api.post('/brands', data),
    update: (id: string, data: any) => api.patch(`/brands/${id}`, data),
    delete: (id: string) => api.delete(`/brands/${id}`),
};

// User APIs
export const userApi = {
    getAll: () => api.get('/users'),
    create: (data: any) => api.post('/users', data),
    update: (id: string, data: any) => api.patch(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
