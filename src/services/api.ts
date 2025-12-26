// Use explicit VITE_API_URL when set (production), otherwise use relative '/api' to allow Vite dev proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData: any) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials: { email: string; password: string }) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  getMe: () => apiCall('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: () => apiCall('/products'),
  getById: (id: string) => apiCall(`/products/${id}`),
  create: (productData: any) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  update: (id: string, productData: any) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  delete: (id: string) => apiCall(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Cart API
export const cartAPI = {
  get: () => apiCall('/cart'),
  addItem: (productId: string, quantity: number) => apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  }),
  updateItem: (itemId: string, quantity: number) => apiCall(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),
  removeItem: (itemId: string) => apiCall(`/cart/${itemId}`, {
    method: 'DELETE',
  }),
};

// Orders API
export const ordersAPI = {
  getAll: () => apiCall('/orders'),
  getById: (id: string) => apiCall(`/orders/${id}`),
  create: (orderData: any) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  initializePayment: (id: string) => apiCall(`/orders/${id}/payment`, {
    method: 'POST',
  }),
  verifyPayment: (id: string) => apiCall(`/orders/${id}/verify`, {
    method: 'POST',
  }),
  approve: (id: string) => apiCall(`/orders/${id}/approve`, {
    method: 'PUT',
  }),
  ship: (id: string) => apiCall(`/orders/${id}/ship`, {
    method: 'PUT',
  }),
  cancel: (id: string) => apiCall(`/orders/${id}/cancel`, {
    method: 'PUT',
  }),
};

// Comments API
export const commentsAPI = {
  getByProduct: (productId: string) => apiCall(`/comments/product/${productId}`),
  create: (commentData: any) => apiCall('/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),
  reply: (id: string, text: string) => apiCall(`/comments/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  approve: (id: string) => apiCall(`/comments/${id}/approve`, {
    method: 'PUT',
  }),
};

// Tracking API
export const trackingAPI = {
  getByTrackingNumber: (trackingNumber: string) => apiCall(`/tracking/${trackingNumber}`),
  update: (trackingNumber: string) => apiCall(`/tracking/${trackingNumber}`, {
    method: 'PUT',
  }),
};

// Reports API
export const reportsAPI = {
  getDaily: (date?: string) => apiCall(`/reports/daily${date ? `?date=${date}` : ''}`),
  getSales: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiCall(`/reports/sales?${params.toString()}`);
  },
  getTopProducts: (limit?: number) => apiCall(`/reports/top-products${limit ? `?limit=${limit}` : ''}`),
  generateDaily: (date?: string) => apiCall('/reports/generate-daily', {
    method: 'POST',
    body: JSON.stringify({ date }),
  }),
};

// Users API
export const usersAPI = {
  getAll: (role?: string) => apiCall(`/users${role ? `?role=${role}` : ''}`),
  create: (userData: any) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: any) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id: string) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),
};

