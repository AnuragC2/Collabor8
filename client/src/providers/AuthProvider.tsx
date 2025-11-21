import { createContext, useContext, useState, useEffect } from "react";
import { getAccessToken, setTokens, clearTokens } from "../utils/AuthToken";
import type { ReactNode } from 'react';


interface AuthContextType {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loading: boolean;
}

// 1. Create context with correct type (nullable initially)
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Hook that ensures context is never null
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);  // finished checking
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    console.log(accessToken, refreshToken)
    setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};