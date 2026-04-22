import { createContext, useEffect, useMemo, useState } from "react";
import apiClient from "../api/apiClient.js";

const STORAGE_KEY = "sms-auth-session";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    return savedSession ? JSON.parse(savedSession) : { token: "", user: null };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (!session.token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await apiClient.get("/auth/profile", {
          token: session.token,
        });

        setSession((previous) => {
          const nextValue = { ...previous, user: profile.user };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
          return nextValue;
        });
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        setSession({ token: "", user: null });
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    const nextSession = { token: response.token, user: response.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession({ token: "", user: null });
  };

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.token),
      loading,
      login,
      logout,
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
