import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Products
  const [products, setProducts] = useState([]);

  // Load products from backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        // Map backend product shape to frontend shape (salePrice/costPrice/notes)
        const rows = res.data || [];
        const mapped = rows.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type || 'Service',
          salePrice: parseFloat(p.price || 0),
          costPrice: parseFloat(p.cost || 0),
          notes: p.description || '',
          recurring: p.recurring || null,
        }));
        if (mounted) setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch products from backend', err?.response?.data || err.message);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  // Subscriptions - Fetch from API
  const [subscriptions, setSubscriptions] = useState([]);

  // Invoices - Fetch from API
  const [invoices, setInvoices] = useState([]);

  // Payments - Intentionally empty as no API exists yet
  const [payments, setPayments] = useState([]);

  // Users - New state for dashboard metrics
  const [usersCount, setUsersCount] = useState(0);

  // Fetch all dashboard data
  const refreshDashboardData = useCallback(async () => {
    try {
      const [subsRes, invRes, usersRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/invoices'),
        api.get('/admin/users') // New route added
      ]);

      if (subsRes.data) setSubscriptions(subsRes.data);
      if (invRes.data) setInvoices(invRes.data);
      if (usersRes.data) setUsersCount(usersRes.data.length);

    } catch (err) {
      console.error('Failed to refresh dashboard data', err);
    }
  }, []);

  // Load initial dashboard data on mount
  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Discounts
  const [discounts, setDiscounts] = useState([]);

  // Load discounts from backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchDiscounts = async () => {
      try {
        const res = await api.get('/discounts');
        const rows = res.data || [];
        const mapped = rows.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type === 'Percentage' || d.type === 'percentage' || d.type === 'Percentage' ? 'Percentage' : (d.type || 'Fixed Amount'),
          value: parseFloat(d.value || 0),
          minPurchase: parseFloat(d.min_purchase || 0),
          startDate: d.start_date || null,
          endDate: d.end_date || null,
        }));
        if (mounted) setDiscounts(mapped);
      } catch (err) {
        console.error('Failed to fetch discounts', err?.response?.data || err.message);
      }
    };
    fetchDiscounts();
    return () => { mounted = false; };
  }, []);

  // Tax Config
  const [taxConfig, setTaxConfig] = useState([
    { id: 1, name: 'Standard Tax', percentage: 15 },
    { id: 2, name: 'Reduced Tax', percentage: 8 },
  ]);

  // Product CRUD
  const addProduct = useCallback(async (product) => {
    try {
      const payload = {
        name: product.name,
        description: product.notes || null,
        price: product.salePrice,
        cost: product.costPrice,
        type: product.type,
        recurring: product.recurring || null,
      };
      const res = await api.post('/products', payload);
      const created = res.data.product || res.data;
      const mapped = {
        id: created.id,
        name: created.name,
        type: created.type || 'Service',
        salePrice: parseFloat(created.price || 0),
        costPrice: parseFloat(created.cost || 0),
        notes: created.description || '',
        recurring: created.recurring || null,
      };
      setProducts(prev => [...prev, mapped]);
      return mapped;
    } catch (err) {
      console.error('Failed to create product', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, product) => {
    try {
      const payload = {
        name: product.name,
        description: product.notes || null,
        price: product.salePrice,
        cost: product.costPrice,
        type: product.type,
        recurring: product.recurring || null,
      };
      const res = await api.put(`/products/${id}`, payload);
      const updated = res.data.product || res.data;
      const mapped = {
        id: updated.id,
        name: updated.name,
        type: updated.type || 'Service',
        salePrice: parseFloat(updated.price || 0),
        costPrice: parseFloat(updated.cost || 0),
        notes: updated.description || '',
        recurring: updated.recurring || null,
      };
      setProducts(prev => prev.map(p => (String(p.id) === String(id) ? mapped : p)));
      return mapped;
    } catch (err) {
      console.error('Failed to update product', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete product', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  // Subscription CRUD & Lifecycle
  // Update subscriptions locally (Optimistic or helper)
  const addSubscription = useCallback((subscription) => {
    // In real app, this should call API, but keeping helper signature
    setSubscriptions(prev => [...prev, subscription]);
  }, []);

  const updateSubscription = useCallback((id, subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...subscription } : s));
  }, []);

  const deleteSubscription = useCallback(async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete subscription', err);
    }
  }, []);

  const updateSubscriptionStatus = useCallback((id, status) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }, []);

  // Invoice generation & management
  const generateInvoice = useCallback((subscriptionId) => {
    const sub = subscriptions.find(s => s.id === subscriptionId);
    if (!sub) return null;

    const newInvoice = {
      id: `INV/2024/${Math.floor(Math.random() * 9000) + 1000}`,
      subscriptionId,
      amount: sub.amount,
      tax: Math.round(sub.amount * 15) / 100,
      status: 'Draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    newInvoice.total = newInvoice.amount + newInvoice.tax;
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, [subscriptions]);

  const updateInvoiceStatus = useCallback((id, status) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  }, []);

  const recordPayment = useCallback((invoiceId, method, amount) => {
    const newPayment = {
      id: `PAY/${Math.floor(Math.random() * 9000) + 1000}`,
      invoiceId,
      method,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
    };
    setPayments(prev => [...prev, newPayment]);
    updateInvoiceStatus(invoiceId, 'Paid');
    return newPayment;
  }, [updateInvoiceStatus]);

  // Discount management
  const addDiscount = useCallback(async (discount) => {
    try {
      const payload = {
        name: discount.name,
        type: discount.type,
        value: discount.value,
        minPurchase: discount.minPurchase || 0,
        startDate: discount.startDate || null,
        endDate: discount.endDate || null,
      };
      const res = await api.post('/discounts', payload);
      const created = res.data.discount || res.data;
      const mapped = {
        id: created.id,
        name: created.name,
        type: created.type === 'Percentage' || created.type === 'percentage' ? 'Percentage' : (created.type || 'Fixed Amount'),
        value: parseFloat(created.value || 0),
        minPurchase: parseFloat(created.min_purchase || 0),
        startDate: created.start_date || null,
        endDate: created.end_date || null,
      };
      setDiscounts(prev => [...prev, mapped]);
      return mapped;
    } catch (err) {
      console.error('Failed to create discount', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  const updateDiscount = useCallback(async (id, discount) => {
    try {
      const payload = {
        name: discount.name,
        type: discount.type,
        value: discount.value,
        minPurchase: discount.minPurchase || 0,
        startDate: discount.startDate || null,
        endDate: discount.endDate || null,
      };
      const res = await api.put(`/discounts/${id}`, payload);
      const updated = res.data.discount || res.data;
      const mapped = {
        id: updated.id,
        name: updated.name,
        type: updated.type === 'Percentage' || updated.type === 'percentage' ? 'Percentage' : (updated.type || 'Fixed Amount'),
        value: parseFloat(updated.value || 0),
        minPurchase: parseFloat(updated.min_purchase || 0),
        startDate: updated.start_date || null,
        endDate: updated.end_date || null,
      };
      setDiscounts(prev => prev.map(d => (String(d.id) === String(id) ? mapped : d)));
      return mapped;
    } catch (err) {
      console.error('Failed to update discount', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  const deleteDiscount = useCallback(async (id) => {
    try {
      await api.delete(`/discounts/${id}`);
      setDiscounts(prev => prev.filter(d => String(d.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete discount', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  // Tax configuration
  const updateTaxConfig = useCallback((taxConfigs) => {
    setTaxConfig(taxConfigs);
  }, []);

  // Reporting metrics (Dynamic)
  const getMetrics = useCallback(() => {
    const activeCount = subscriptions.filter(s => s.status === 'Active' || s.status === 'confirmed').length;
    // Calculate revenue from subscriptions total_amount (using fetched data structure)
    // Assuming 'total_amount' is the field from backend
    const totalRevenue = subscriptions.reduce((sum, s) => sum + (parseFloat(s.total_amount) || parseFloat(s.amount) || 0), 0);

    // Invoices metrics
    const paidInvoices = invoices.filter(i => i.status === 'Paid' || i.status === 'paid').length;
    // Overdue check
    const overdueInvoices = invoices.filter(i => {
      if (i.status === 'Paid' || i.status === 'paid') return false;
      const dueDate = i.due_date || i.dueDate;
      return dueDate ? new Date(dueDate) < new Date() : false;
    }).length;

    return {
      activeSubscriptions: activeCount,
      totalRevenue,
      paidInvoices,
      overdueInvoices,
      totalInvoices: invoices.length,
      totalUsers: usersCount, // Added
    };
  }, [subscriptions, invoices, usersCount]);

  return (
    <DataContext.Provider value={{
      // Products
      products, addProduct, updateProduct, deleteProduct,
      // Subscriptions
      subscriptions, addSubscription, updateSubscription, deleteSubscription, updateSubscriptionStatus,
      // Invoices
      invoices, generateInvoice, updateInvoiceStatus,
      // Payments
      payments, recordPayment,
      // Discounts
      discounts, addDiscount, updateDiscount, deleteDiscount,
      // Tax
      taxConfig, updateTaxConfig,
      // Reporting
      getMetrics, refreshDashboardData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
