import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AUTH APIs
export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const signupUser = (userData) => {
  return apiClient.post('/auth/signup', userData);
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// SUBSCRIPTION APIs
export const getSubscriptions = () => {
  return apiClient.get('/subscriptions');
};

export const createSubscription = (data) => {
  return apiClient.post('/subscriptions', data);
};

export const getSubscriptionById = (id) => {
  return apiClient.get(`/subscriptions/${id}`);
};

export const updateSubscription = (id, data) => {
  return apiClient.put(`/subscriptions/${id}`, data);
};

export const updateSubscriptionStatus = (id, status) => {
  return apiClient.patch(`/subscriptions/${id}/status`, { status });
};

export const deleteSubscription = (id) => {
  return apiClient.delete(`/subscriptions/${id}`);
};

// PRODUCT APIs
export const getProducts = () => {
  return apiClient.get('/products');
};

export const createProduct = (data) => {
  return apiClient.post('/products', data);
};

export const getProductById = (id) => {
  return apiClient.get(`/products/${id}`);
};

export const updateProduct = (id, data) => {
  return apiClient.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return apiClient.delete(`/products/${id}`);
};

// INVOICE APIs
export const getInvoices = () => {
  return apiClient.get('/invoices');
};

export const getInvoiceById = (id) => {
  return apiClient.get(`/invoices/${id}`);
};

export const createInvoice = (data) => {
  return apiClient.post('/invoices', data);
};

export const updateInvoice = (id, data) => {
  return apiClient.put(`/invoices/${id}`, data);
};

// PAYMENT APIs
export const getPayments = () => {
  return apiClient.get('/payments');
};

export const createPayment = (data) => {
  return apiClient.post('/payments', data);
};

export const updatePaymentStatus = (id, status) => {
  return apiClient.patch(`/payments/${id}/status`, { status });
};

export default apiClient;
