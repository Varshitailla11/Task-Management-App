import {
    createContext,
    useContext,
    useState,
  } from "react";
  
  import {
    getCurrentUser,
    getToken,
    logout as logoutUser,
    saveAuth,
  } from "../services/authService";
  
  const AuthContext = createContext(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL.replace(
    /\/tasks\/?$/,
    ""
  );
  
  export function AuthProvider({ children }) {
    const [user, setUser] = useState(
      getCurrentUser()
    );
  
    const [loading, setLoading] =
      useState(false);
  
    const isAuthenticated = Boolean(
      getToken() && user
    );
  
    const login = async (
      email,
      password
    ) => {
      try {
        setLoading(true);
  
        const response = await fetch(
          `${API_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(
            data.message ||
              "Login failed"
          );
        }
  
        saveAuth(
          data.token,
          data.user
        );
  
        setUser(data.user);
  
        return data;
      } finally {
        setLoading(false);
      }
    };
  
    const register = async (
      name,
      email,
      password
    ) => {
      try {
        setLoading(true);
  
        const response = await fetch(
          `${API_BASE_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              password,
            }),
          }
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(
            data.message ||
              "Registration failed"
          );
        }
  
        saveAuth(
          data.token,
          data.user
        );
  
        setUser(data.user);
  
        return data;
      } finally {
        setLoading(false);
      }
    };
  
    const logout = () => {
      logoutUser();
      setUser(null);
    };
  
    const value = {
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    };
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context =
      useContext(AuthContext);
  
    if (!context) {
      throw new Error(
        "useAuth must be used within an AuthProvider"
      );
    }
  
    return context;
  }