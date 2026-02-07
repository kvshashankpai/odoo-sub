import React from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address and we will send you a link to reset your password.
        </p>
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full p-2 border rounded"
            required 
          />
          <button className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90">
            Send Reset Link
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-secondary hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}