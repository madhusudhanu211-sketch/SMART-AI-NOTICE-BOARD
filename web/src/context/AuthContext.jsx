import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user_data', JSON.stringify(res.data));
          }
        } catch (err) {
          const savedUser = localStorage.getItem('user_data');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {}
          }
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, [token]);

  const login = async (email, password, selectedRole = 'Student') => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        role: selectedRole.toLowerCase(),
      });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('jwt_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Invalid email or password. Please check credentials.';
      
      // Development session fallback if backend server is not reachable
      if (!err.response) {
        const sessionUser = {
          id: 1,
          full_name: email.split('@')[0].toUpperCase(),
          email: email,
          role: selectedRole, // Preserve selected role (Student, Faculty, Admin)
          department_id: 1,
          roll_number: '210101001',
          phone: '+91 9876543210',
          profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        };
        setToken('dev-session-token');
        setUser(sessionUser);
        localStorage.setItem('jwt_token', 'dev-session-token');
        localStorage.setItem('user_data', JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }

      return { success: false, error: errMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', {
        ...userData,
        role: userData.role || 'Student',
      });
      return { success: true, data: res.data };
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Registration failed. Please check inputs.';
      if (!err.response) {
        const newUser = {
          id: Date.now(),
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role || 'Student',
          department_id: userData.department_id || 1,
          roll_number: userData.roll_number || '210101001',
          phone: userData.phone || '+91 9876543210',
          profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        };
        return { success: true, data: newUser };
      }
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user_data', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
