import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    // Redirect based on simulated role (logic inside AuthContext)
    if (email.includes('admin') || email.includes('internal')) {
      navigate('/app');
    } else {
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">Odoo</h1>
        <p className="text-gray-500 text-center mb-8">Subscription Management</p>
        
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
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 transition">
            Login
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