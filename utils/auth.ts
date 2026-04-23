export type AuthUser = {
  // CUSTOMER
  MA_KH?: string;
  TEN_KH?: string;
  NGAY_SINH?: string;
  CCCD?: string;
  SDT?: string;
  GIOI_TINH?: string;
  EMAIL?: string;

  // STAFF (ADMIN, SALE, BRANCH_MANAGER)
  MA_NV?: string;
};

const AUTH_KEY = "auth";

export type AuthData = {
  name: string;
  role: "CUSTOMER" | "SALE" | "BRANCH_MANAGER";
  token: string | null;
  user: AuthUser;
};

/**
 * Lưu auth data sau khi login
 */
export const setAuthData = (data: AuthData) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

export const saveAuthData = setAuthData;

/**
 * Lấy toàn bộ auth data
 */
export const getAuthData = (): AuthData | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
};

/**
 * Xóa auth data (logout)
 */
export const clearAuthData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
};

/**
 * Helpers
 */
export const getUserName = () => getAuthData()?.name ?? null;
export const getUserRole = () => getAuthData()?.role ?? null;
export const getToken = () => getAuthData()?.token ?? null;
export const isAuthenticated = () => !!getAuthData();
