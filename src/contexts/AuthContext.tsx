import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Session invalid or expired');
      }

      const data = await response.json();
      setProfile(data);
      setUser({
        uid: data.id,
        email: data.email,
        displayName: data.display_name
      });
    } catch (err) {
      console.warn("Failed to fetch user profile, clearing session:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('auth_token', token);
    setProfile(userData);
    setUser({
      uid: userData.id,
      email: userData.email,
      displayName: userData.display_name
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
  };

  // For this project, both 'admin' and 'staff' roles are granted NGO administrative panel permissions.
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
