'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, getToken, setToken } from './apiClient';

const AuthCtx = createContext(null);

// Holds the logged-in user + token for the whole app.
// On reload, restores the session from the stored JWT via /api/auth/me.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setAuthLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => setToken(null)) // bad/expired token -> drop it
      .finally(() => setAuthLoading(false));
  }, []);

  const login = (nextUser, token) => {
    setToken(token);
    setUser(nextUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
