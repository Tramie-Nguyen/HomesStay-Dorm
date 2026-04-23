"use client";

import { useEffect, useState } from "react";
import { getAuthData, getUserName, getUserRole, getToken } from "../utils/auth";

type UserState = {
  name: string | null;
  role: string | null;
  token: string | null;
};

export const useAuth = () => {
  const [user, setUser] = useState<UserState>({
    name: null,
    role: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authData = getAuthData();

    setUser({
      name: authData?.name ?? null,
      role: authData?.role ?? null,
      token: authData?.token ?? null,
    });

    setIsAuthenticated(!!authData);
    setLoading(false);
  }, []);

  /**
   * Gọi sau login / logout
   */
  const updateUser = () => {
    const authData = getAuthData();

    setUser({
      name: authData?.name ?? null,
      role: authData?.role ?? null,
      token: authData?.token ?? null,
    });

    setIsAuthenticated(!!authData);
  };

  return {
    user,
    loading,
    isAuthenticated,
    updateUser,
    getUserName,
    getUserRole,
    getToken,
  };
};
