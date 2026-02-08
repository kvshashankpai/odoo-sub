import React, { createContext, useContext, useEffect, useState } from 'react';
import { useData } from './DataContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [lastOrder, setLastOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('last_order') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('last_order', JSON.stringify(lastOrder));
  }, [lastOrder]);

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id, qty) => setItems((prev) => prev.map((p) => p.id === id ? { ...p, qty: Math.max(1, qty) } : p));

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((s, it) => s + ((it.salePrice || it.price) * (it.qty || 1)), 0);

  // Compute applicable discount based on current discounts from DataContext
  const { discounts } = useData();

  const computeDiscountAmount = (subtotalAmount) => {
    if (!discounts || discounts.length === 0) return 0;
    const now = new Date();
    // Find all discounts that are active and satisfy minPurchase
    const applicable = discounts.filter(d => {
      const start = d.startDate ? new Date(d.startDate) : null;
      const end = d.endDate ? new Date(d.endDate) : null;
      if (start && now < start) return false;
      if (end && now > end) return false;
      if (d.minPurchase && subtotalAmount < d.minPurchase) return false;
      return true;
    });
    if (applicable.length === 0) return 0;
    // Choose the best (max savings)
    const amounts = applicable.map(d => {
      if ((d.type || '').toLowerCase().includes('percent')) {
        return Math.round((subtotalAmount * (d.value / 100)) * 100) / 100;
      }
      return parseFloat(d.value || 0);
    });
    return Math.max(...amounts, 0);
  };

  const discountAmount = computeDiscountAmount(subtotal);

  const placeOrder = () => {
    const orderRef = `S${Math.floor(Math.random() * 9000) + 1000}`;
    const taxes = +(Math.max(subtotal - discountAmount, 0) * 0.15).toFixed(2);
    const total = +(Math.max(subtotal - discountAmount, 0) + taxes).toFixed(2);
    const order = {
      reference: orderRef,
      date: new Date().toISOString(),
      items,
      subtotal,
      discount: discountAmount,
      taxes,
      total,
    };
    setLastOrder(order);
    clearCart();
    return order;
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal, discountAmount, placeOrder, lastOrder }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
