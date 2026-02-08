import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signupUser } from '../api'; // Import API

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  // Strict Password Validation [Requirement 5.4]
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check Passwords Match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Check Password Strength
    if (!validatePassword(formData.password)) {
      setError("Password must be 8+ chars, with Uppercase, Lowercase, and a Special Character.");
      return;
    }

    setLoading(true);

    try {
      // 3. Real API Call
      const response = await signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Auto-login on success
      const { token, user } = response.data;
      login(user);
      localStorage.setItem('token', token);

      alert("Account created successfully!");
      // Redirect to portal for new customers
      navigate('/portal');

    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">SubFlow</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 mb-6 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="email"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="password"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">8+ chars, 1 Uppercase, 1 Lowercase, 1 Special</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="password"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-opacity-90 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}