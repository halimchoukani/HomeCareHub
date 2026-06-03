import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, API_URL, setAuthToken } from "../constants/api";
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
  deviceId: string | null;
  setDeviceId: (id: string | null) => void;
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (userData: Record<string, unknown>) => Promise<string | null | void>;
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

export const getCurrentUser = async () => {
  try {
    const tokenData = await storage.getItem("token");
    const token = JSON.parse(tokenData as string) as string;
    const resourceResponse = await api.get("/api/auth/me/", {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const resourceData: User = resourceResponse.data;
    return resourceData;
  } catch (err) {
    console.error("Failed fetching user resource", err);
    throw err;
  }
}

export const getDeviceId = async () => {
  try {
    const tokenData = await storage.getItem("token");
    if (!tokenData) {
      return null;
    }
    const token = JSON.parse(tokenData as string) as string;
    const deviceData = await fetch(`${API_URL}/api/devices/userDevices/`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!deviceData.ok) {
      return null;
    }
    const data = await deviceData.json();
    return data[0];
  } catch (err) {
    console.error("Failed fetching device id", err);
    throw err;
  }
}


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const [userData, tokenData] = await Promise.all([
          storage.getItem("user"),
          storage.getItem("token"),
        ]);
        const data = await getCurrentUser();
        console.log("data : ", data);
        if (userData) {


          setUser(data);
        };
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
  useEffect(() => {
    const loadDeviceId = async () => {
      try {
        const deviceData = await getDeviceId();
        if (deviceData) {
          setDeviceId(deviceData);
        };
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDeviceId();
  }, []);

  const login = async (userData: Record<string, unknown>) => {
    const jwt = (userData.token || userData.access) as string;
    setAuthToken(jwt);
    try {
      const resourceResponse = await api.get("/api/auth/me/");
      const resourceData: User = resourceResponse.data;
      setUser(resourceData);
      setToken(jwt);
      await storage.setItem("user", JSON.stringify(resourceData));
      await storage.setItem("token", JSON.stringify(jwt));

      let fetchedDeviceId = null;
      try {
        fetchedDeviceId = await getDeviceId();
        if (fetchedDeviceId) {
          setDeviceId(fetchedDeviceId);
        }
      } catch (e) {
        console.error("No device id found during login");
      }
      return fetchedDeviceId;
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
    deviceId,
    setDeviceId,
    token,
    role: user?.role || null,
    loading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
