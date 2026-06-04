export interface MetricSummary {
  totalUsers: number;
  totalDevices: number;
  totalPersons: number;
  activePersons: number;
  inactivePersons: number;
  activeAlerts: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  facePhoto?: string;
  isAdmin: boolean;
  _count: { devices: number };
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  user: {
    username: string;
    email: string;
  };
  persons: {
    userId: string;
  }[];
  _count: {
    persons: number;
  };
  status: "online" | "warning" | "offline";
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  msg: string;
  source: string;
  age: string;
}

export interface MessageLog {
  id: string;
  sender: string;
  type: "broadcast" | "direct";
  target: string;
  userId?: string;
  content: string;
  timestamp: string;
}

export interface ChartData {
  name: string;
  users: number;
  devices: number;
  alerts: number;
}

export interface DashboardPayload {
  metrics: MetricSummary;
  deviceStatuses: {
    online: number;
    warning: number;
    offline: number;
  };
  registrationsOverTime: ChartData[];
  alerts: Alert[];
  messageHistory: MessageLog[];
}
