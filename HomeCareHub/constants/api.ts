import axios from "axios";

export const API_URL = "http://192.168.1.3:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token: string | null | undefined) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const useLogin = async (email: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login/", {
      email: email,
      password,
    });
    return response.data;
  } catch (err: any) {
    console.warn("Login error", err.response?.data || err.message || err);
    return null;
  }
};

export const useSignup = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const response = await api.post("/api/auth/signup/", {
      username: email,
      email,
      password,
      name,
    });
    return response.data;
  } catch (err: any) {
    console.warn("Signup error", err.response?.data || err.message || err);
    return null;
  }
};

export default api;
