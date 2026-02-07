import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { DataProvider } from './context/DataContext.js';
import Login from './pages/auth/Login.js';
import Signup from './pages/auth/Signup.js';
import ForgotPassword from './pages/auth/ForgotPassword.js'; // NEW
import Layout from './components/Layout.js';

// Admin Pages
import Dashboard from './pages/admin/Dashboard.js';
import ProductList from './pages/admin/ProductList.js';
import ProductForm from './pages/admin/ProductForm.js';
import SubscriptionList from './pages/admin/SubscriptionList.js';
import SubscriptionDetail from './pages/admin/SubscriptionDetail.js';
import Reporting from './pages/admin/Reporting.js'; // NEW
import Configuration from './pages/admin/Configuration.js'; // NEW
import DiscountList from './pages/admin/DiscountList.js'; // NEW
import DiscountForm from './pages/admin/DiscountForm.js'; // NEW
import PaymentList from './pages/admin/PaymentList.js';   // NEW

// Portal Pages
import PortalHome from './pages/portal/PortalHome.js';
import Shop from './pages/portal/Shop.js'; // NEW
import Cart from './pages/portal/Cart.js'; // NEW
import MyOrders from './pages/portal/MyOrders.js'; // NEW
import OrderDetail from './pages/portal/OrderDetail.js'; // NEW
import MySubscription from './pages/portal/MySubscription.js'; // NEW

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <Router>
            <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/app" element={<ProtectedRoute allowedRoles={['admin', 'internal']}><Layout type="admin" /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="subscriptions" element={<SubscriptionList />} />
            <Route path="subscriptions/new" element={<SubscriptionDetail />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="configuration" element={<Configuration />} />
            <Route path="discounts" element={<DiscountList />} />
            <Route path="discounts/new" element={<DiscountForm />} />
            <Route path="discounts/:id" element={<DiscountForm />} />
            <Route path="payments" element={<PaymentList />} />
          </Route>

          {/* Portal Routes */}
          <Route path="/portal" element={<ProtectedRoute allowedRoles={['portal']}><Layout type="portal" /></ProtectedRoute>}>
            <Route index element={<PortalHome />} />
            <Route path="shop" element={<Shop />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="subscription" element={<MySubscription />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}