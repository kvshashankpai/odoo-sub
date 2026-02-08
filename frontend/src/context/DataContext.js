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

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState([
    { id: 'S0001', customer: 'Mitchell Admin', planId: 1, status: 'Active', startDate: '2024-02-10', expiryDate: '2025-02-10', paymentTerms: 'Monthly', amount: 140 },
    { id: 'S0002', customer: 'John Doe', planId: 2, status: 'Active', startDate: '2024-01-15', expiryDate: '2025-01-15', paymentTerms: 'Monthly', amount: 116 },
    { id: 'S0003', customer: 'TechCorp Inc', planId: 3, status: 'Quotation', startDate: '2024-02-20', expiryDate: '2025-02-20', paymentTerms: 'Yearly', amount: 230 },
  ]);

  // Invoices
  const [invoices, setInvoices] = useState([
    { id: 'INV/2024/001', subscriptionId: 'S0001', amount: 140, tax: 21, total: 161, status: 'Paid', dueDate: '2024-02-20', issueDate: '2024-02-10' },
    { id: 'INV/2024/002', subscriptionId: 'S0002', amount: 116, tax: 17.4, total: 133.4, status: 'Pending', dueDate: '2024-02-19', issueDate: '2024-02-09' },
  ]);

  // Payments
  const [payments, setPayments] = useState([
    { id: 'PAY/001', invoiceId: 'INV/2024/001', method: 'Card', amount: 161, date: '2024-02-15', status: 'Completed' },
  ]);

  // Discounts
  const [discounts, setDiscounts] = useState([
    { id: 1, name: 'Early Bird', type: 'percentage', value: 10, minPurchase: 50, startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 2, name: 'Bulk', type: 'fixed', value: 25, minQuantity: 5, startDate: '2024-01-01', endDate: '2024-12-31' },
  ]);

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
  const addSubscription = useCallback((subscription) => {
    const newSub = { 
      ...subscription, 
      id: `S${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'Draft'
    };
    setSubscriptions(prev => [...prev, newSub]);
    return newSub;
  }, []);

  const updateSubscription = useCallback((id, subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...subscription } : s));
  }, []);

  const deleteSubscription = useCallback((id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSubscriptionStatus = useCallback((id, status) => {
    const validStatuses = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
    if (validStatuses.includes(status)) {
      updateSubscription(id, { status });
    }
  }, [updateSubscription]);

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
  const addDiscount = useCallback((discount) => {
    const newDiscount = { ...discount, id: Math.max(...discounts.map(d => d.id), 0) + 1 };
    setDiscounts(prev => [...prev, newDiscount]);
    return newDiscount;
  }, [discounts]);

  const updateDiscount = useCallback((id, discount) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, ...discount } : d));
  }, []);

  const deleteDiscount = useCallback((id) => {
    setDiscounts(prev => prev.filter(d => d.id !== id));
  }, []);

  // Tax configuration
  const updateTaxConfig = useCallback((taxConfigs) => {
    setTaxConfig(taxConfigs);
  }, []);

  // Reporting metrics
  const getMetrics = useCallback(() => {
    const activeCount = subscriptions.filter(s => s.status === 'Active').length;
    const totalRevenue = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const paidInvoices = invoices.filter(i => i.status === 'Paid').length;
    const overdueInvoices = invoices.filter(i => i.status === 'Pending' && new Date(i.dueDate) < new Date()).length;

    return {
      activeSubscriptions: activeCount,
      totalRevenue,
      paidInvoices,
      overdueInvoices,
      totalInvoices: invoices.length,
    };
  }, [subscriptions, invoices]);

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
      getMetrics,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
