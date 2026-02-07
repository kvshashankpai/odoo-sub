import React, { createContext, useContext, useEffect, useState } from 'react';

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

  const placeOrder = () => {
    const orderRef = `S${Math.floor(Math.random() * 9000) + 1000}`;
    const order = {
      reference: orderRef,
      date: new Date().toISOString(),
      items,
      subtotal,
      taxes: +(subtotal * 0.15).toFixed(2),
      total: +(subtotal * 1.15).toFixed(2),
    };
    setLastOrder(order);
    clearCart();
    return order;
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal, placeOrder, lastOrder }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
