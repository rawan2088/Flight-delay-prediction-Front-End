import React, { useState, useEffect } from "react";
import type { User, RegisterData, ProfileUpdate } from "./AuthContextType";
import { AuthContext, API_URL } from "./AuthContextType";
import { authFetch, errorMessage } from "../utils/Api";

const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on page load
  useEffect(() => {
    if (localStorage.getItem("refresh_token")) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // authFetch refreshes an expired access token automatically
  const fetchUserProfile = async () => {
    try {
      const res = await authFetch(`${API_URL}/profile/`);
      if (res.ok) setUser(await res.json());
      else clearTokens();
    } catch {
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(errorMessage(data, "Login failed"));

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    await fetchUserProfile();
  };

  const register = async (userData: RegisterData) => {
    const res = await fetch(`${API_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error(JSON.stringify(await res.json()));

    const data = await res.json();
    localStorage.setItem("access_token", data.tokens.access);
    localStorage.setItem("refresh_token", data.tokens.refresh);
    setUser(data.user);
  };

  const updateProfile = async (values: ProfileUpdate) => {
    const res = await authFetch(`${API_URL}/profile/update/`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(errorMessage(data, "Update failed"));
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const logout = () => {
    // Blacklist the refresh token on the server (fire-and-forget).
    // The request is built synchronously, before we clear storage below.
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      authFetch(`${API_URL}/logout/`, {
        method: "POST",
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
