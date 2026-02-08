import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { DataProvider } from './context/DataContext.js';

// Landing Page
import LandingPage from './pages/LandingPage.js';

// Auth Pages
import Login from './pages/auth/Login.js';
import Signup from './pages/auth/Signup.js';
import ForgotPassword from './pages/auth/ForgotPassword.js';

// Layout
import Layout from './components/Layout.js';

// Admin Pages
import Dashboard from './pages/admin/Dashboard.js';
import ProductList from './pages/admin/ProductList.js';
import ProductForm from './pages/admin/ProductForm.js';
import SubscriptionList from './pages/admin/SubscriptionList.js';
import SubscriptionDetail from './pages/admin/SubscriptionDetail.js';
import InvoiceDraft from './pages/admin/InvoiceDraft.js';
import Users from './pages/admin/Users.js';
// --- NEW IMPORT HERE ---
import SubscriptionForm from './components/SubscriptionForm.js'; 
// -----------------------

import Reporting from './pages/admin/Reporting.js';
import Configuration from './pages/admin/Configuration.js';
import DiscountList from './pages/admin/DiscountList.js';
import DiscountForm from './pages/admin/DiscountForm.js';
import PaymentList from './pages/admin/PaymentList.js';

// Portal Pages
import PortalHome from './pages/portal/PortalHome.js';
import Shop from './pages/portal/Shop.js';
import Cart from './pages/portal/Cart.js';
import MyOrders from './pages/portal/MyOrders.js';
import OrderDetail from './pages/portal/OrderDetail.js';
import MySubscription from './pages/portal/MySubscription.js';

// Protected Route Component
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
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin Routes */}
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'internal']}>
                    <Layout type="admin" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                
                {/* Product Routes */}
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id" element={<ProductForm />} />
                
                {/* Subscription Routes - nested so list can render child views via Outlet */}
                <Route path="subscriptions" element={<SubscriptionList />}>
                  <Route index element={<div />} />
                  <Route path="new" element={<SubscriptionForm />} />
                  <Route path=":id" element={<SubscriptionDetail />} />
                </Route>
                
                {/* Other Admin Routes */}
                <Route path="reporting" element={<Reporting />} />
                {/* Invoice Draft (view & actions for newly created invoices) */}
                <Route path="invoices/draft/:id" element={<InvoiceDraft />} />
                {/* Users/Contacts - admin only */}
                <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
                <Route path="configuration" element={<Configuration />} />
                <Route path="discounts" element={<DiscountList />} />
                <Route path="discounts/new" element={<DiscountForm />} />
                <Route path="discounts/:id" element={<DiscountForm />} />
                <Route path="payments" element={<PaymentList />} />
              </Route>

              {/* Portal Routes */}
              <Route 
                path="/portal" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'portal']}>
                    <Layout type="portal" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PortalHome />} />
                <Route path="shop" element={<Shop />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="subscription" element={<MySubscription />} />
              </Route>

              {/* Default Route */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Catch all for 404 (Optional but recommended) */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}