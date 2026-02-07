import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Products
  const [products, setProducts] = useState([
    { id: 1, name: 'Monthly Standard', type: 'Service', salePrice: 29, costPrice: 10, notes: '5 users' },
    { id: 2, name: 'Monthly Pro', type: 'Service', salePrice: 99, costPrice: 30, notes: 'Unlimited users' },
    { id: 3, name: 'Yearly Enterprise', type: 'Service', salePrice: 999, costPrice: 300, notes: 'Custom integrations' },
  ]);

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
  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: Math.max(...products.map(p => p.id), 0) + 1 };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, [products]);

  const updateProduct = useCallback((id, product) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
