import { saveAuthData, clearAuthData } from "../utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    name: string;
    role: string;
    id: string;
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: "CUSTOMER", // fix cứng
      }),
    });

    const result = await response.json();

    if (result.success && result.data) {
      saveAuthData({
        token: result.data.token,
        name: result.data.name,
        role: result.data.role,
        id: result.data.id,
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "Network error",
    };
  }
};

export const signIn = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success && result.data) {
      saveAuthData({
        token: result.data.token,
        name: result.data.name,
        id: result.data.id,
        role: result.data.role,
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "Login failed!",
    };
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signout`, {
      method: "POST",
    });

    const result = await response.json();

    clearAuthData();

    return result;
  } catch (error) {
    clearAuthData();
    return {
      success: false,
      message: "Network error",
    };
  }
};

export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Network error",
    };
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Network error",
    };
  }
};
