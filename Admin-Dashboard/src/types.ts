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
  isAdmin: boolean;
  deviceCount: number;
  joinDate: string;
}

export interface Device {
  id: string;
  name: string;
  ownerId: string;
  ownerUsername: string;
  ownerEmail: string;
  registeredPersonsCount: number;
  status: "online" | "warning" | "offline";
  model: string;
  signalStrength: string;
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
