import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const vendorData = localStorage.getItem('selectedVendor');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    if (vendorData) {
      setSelectedVendor(JSON.parse(vendorData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedVendor');
    setUser(null);
    setSelectedVendor(null);
  };

  const selectVendor = (vendor) => {
    localStorage.setItem('selectedVendor', JSON.stringify(vendor));
    setSelectedVendor(vendor);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, selectedVendor, selectVendor }}>
      {children}
    </AuthContext.Provider>
  );
};
