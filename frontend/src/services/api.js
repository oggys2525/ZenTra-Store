import axios from 'axios';

// Set base API URL dynamically (default to localhost:8000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zentra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth errors (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect if unauthorized (except during login)
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('zentra_token');
        localStorage.removeItem('zentra_user');
        window.dispatchEvent(new Event('auth_change'));
      }
    }
    return Promise.reject(error);
  }
);

// ========================================================
// API Endpoints Services
// ========================================================
export const authService = {
  login: async (Username, Password) => {
    const response = await api.post('/api/login', { Username, Password });
    if (response.data.access_token) {
      localStorage.setItem('zentra_token', response.data.access_token);
      localStorage.setItem('zentra_user', JSON.stringify({
        username: response.data.username,
        role: response.data.role,
        fullname: response.data.fullname,
      }));
      window.dispatchEvent(new Event('auth_change'));
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/api/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('zentra_token');
    localStorage.removeItem('zentra_user');
    window.dispatchEvent(new Event('auth_change'));
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('zentra_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('zentra_token');
  },
};

export const productService = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/api/products?${params.toString()}`);
    return response.data;
  },
  getProduct: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },
  getOrder: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, statusData) => {
    const response = await api.put(`/api/orders/${id}`, statusData);
    return response.data;
  },
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },
  updateSettings: async (settingsData) => {
    const response = await api.put('/api/settings', settingsData);
    return response.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/src/assets/logo.png'; // Fallback
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export default api;
