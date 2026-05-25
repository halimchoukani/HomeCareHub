import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken } from "../constants/api";
import storage from "./storage";

interface User {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (userData: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [userData, tokenData] = await Promise.all([
          storage.getItem("user"),
          storage.getItem("token"),
        ]);
        if (userData) setUser(JSON.parse(userData));
        if (tokenData) {
          const parsed = JSON.parse(tokenData) as string;
          setToken(parsed);
          setAuthToken(parsed);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData: Record<string, unknown>) => {
    const jwt = userData.access as string;
    setAuthToken(jwt);
    try {
      const resourceResponse = await api.get("/api/auth/me/");
      const resourceData: User = resourceResponse.data;
      setUser(resourceData);
      setToken(jwt);
      await storage.setItem("user", JSON.stringify(resourceData));
      await storage.setItem("token", JSON.stringify(jwt));
    } catch (err) {
      console.error("Failed fetching user resource", err);
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await storage.removeItem("user");
    await storage.removeItem("token");
  };

  const value: UserContextType = {
    user,
    token,
    role: user?.role || null,
    loading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
