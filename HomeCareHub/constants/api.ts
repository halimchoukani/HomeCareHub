import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_URL = "http://10.0.2.2:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getTokenFromStorage = async () => {
  const tokenData = await AsyncStorage.getItem("token");
  if (!tokenData) return null;
  try {
    return JSON.parse(tokenData);
  } catch {
    return tokenData;
  }
}

export const setAuthToken = (token: string | null | undefined) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const useLogin = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login/", {
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
  formData: FormData,
) => {
  try {
    const response = await api.post("/auth/signup/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });
    return response.data;
  } catch (err: any) {
    console.warn("Signup error", err.response?.data || err.message || err);
    return err;
  }
};

export default api;
