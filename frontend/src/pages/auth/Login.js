import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../api'; // Import API

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Added error state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call Backend
      const response = await loginUser({ email, password });
      
      const { token, user } = response.data;

      console.log('Login response:', response.data);
      console.log('User role:', user.role);

      // 2. Save Token and User to Context
      login(user);
      localStorage.setItem('token', token);

      // 3. Redirect based on Role (from DB)
      console.log('Checking role:', user.role);
      if (user.role === 'admin' || user.role === 'internal') {
        console.log('Redirecting to admin dashboard');
        navigate('/app'); // Admin Dashboard
      } else if (user.role === 'customer' || user.role === 'portal') {
        console.log('Redirecting to portal');
        navigate('/portal'); // Customer Portal
      } else {
        console.log('Unknown role, redirecting to login');
        navigate('/login'); // Unknown role, redirect to login
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">SubFlow</h1>
        <p className="text-gray-500 text-center mb-8">Subscription Management</p>
        
        {/* Error Message UI Added */}
        {error && (
            <div className="bg-red-50 text-red-600 p-2 text-sm rounded mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="admin@odoo.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Try <span className="font-mono text-xs bg-gray-200 p-1 rounded">admin@odoo.com</span> for Admin</p>
          <p className="mt-2">
            Don't have an account? <Link to="/signup" className="text-secondary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}