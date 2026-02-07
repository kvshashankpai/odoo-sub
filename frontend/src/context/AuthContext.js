import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // --- DEVELOPER MODE: AUTO-LOGIN ---
  useEffect(() => {
    // Uncomment this to force login as Admin immediately
    // setUser({ name: 'Mitchell Admin', email: 'admin@odoo.com', role: 'admin' }); 
    
    // If you want to test Portal view later, comment the line above and uncomment this:
    setUser({ name: 'Client User', email: 'client@gmail.com', role: 'portal' });
  }, []);
  // ----------------------------------

  const login = (email, password) => {
    if (email.includes('admin')) {
      setUser({ name: 'Mitchell Admin', email, role: 'admin' });
    } else if (email.includes('internal')) {
      setUser({ name: 'Internal User', email, role: 'internal' });
    } else {
      setUser({ name: 'Portal User', email, role: 'portal' });
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);