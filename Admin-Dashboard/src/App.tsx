import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Cpu,
  Users,
  Megaphone,
  LogOut,
  Wifi,
  WifiOff,
  CornerDownRight,
  Terminal,
  Grid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

import { fetchDashboardData as apiFetchDashboard } from "./api/dashboard";
import { fetchUsers as apiFetchUsers, deleteUser } from "./api/users";
import { fetchDevices as apiFetchDevices, deleteDevice, createDevice } from "./api/devices";
import { sendDirectMessage, sendGlobalBroadcast } from "./api/messages";
import { fetchLogs as apiFetchLogs } from "./api/logs";

import { DashboardPayload, User as TypeUser, Device as TypeDevice } from "./types";
import DashboardPage from "./pages/dashboard";
import LoginPage from "./pages/login";
import UsersPage from "./pages/users";
import DevicesPage from "./pages/devices";
import LogsPage from "./pages/logs";
import BroadcastModal from "./components/BroadcastModal";
import NotificationToast, { ToastItem } from "./components/NotificationToast";

export default function App() {
  // Theme state settings (defaults to sleek dark mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("carehub_dark_theme");
    return saved ? saved === "true" : true;
  });

  // Auth structures & states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("carehub_admin_token"));
  const [customKey, setCustomKey] = useState("carehub_jwt_super_access_key_99");

  // Routing / View Tabs
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname === "/" ? "dashboard" : location.pathname.substring(1);

  // Main payloads
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [usersList, setUsersList] = useState<TypeUser[]>([]);
  const [devicesList, setDevicesList] = useState<TypeDevice[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Telemetry load toggles
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(true);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);

  // Broadcast overlay controller
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  // Dynamic live socket connection diagnostics
  const [gatewayStatus, setGatewayStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");
  const socketRef = useRef<Socket | null>(null);

  // Real-time toast elements queue
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 1. Sync document HTML class with theme state
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("carehub_dark_theme", String(darkMode));
  }, [darkMode]);

  // Utility to push local client warnings/success indicators
  const pushToast = (
    type: "broadcast" | "direct" | "system" | "success" | "error",
    title: string,
    message: string
  ) => {
    const newId = `t-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastItem = {
      id: newId,
      type,
      title,
      message,
      timestamp: new Date()
    };
    setToasts((prev) => [...prev, newToast]);

    // Self-dismiss after 6.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newId));
    }, 6500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 2. Load API payloads
  const fetchDashboardData = async (activeToken: string) => {
    try {
      setLoadingDashboard(true);
      const d = await apiFetchDashboard(activeToken);
      setDashboardData(d);
    } catch (err: any) {
      pushToast("error", "Intel Sync Refused", err.message || "Failed retrieving stats");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchUsers = async (activeToken: string) => {
    try {
      setLoadingUsers(true);
      const u = await apiFetchUsers(activeToken);
      setUsersList(u);
    } catch (err: any) {
      pushToast("error", "Caregiver Sync Failed", err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDevices = async (activeToken: string) => {
    try {
      setLoadingDevices(true);
      const dev = await apiFetchDevices(activeToken);
      setDevicesList(dev);
    } catch (err: any) {
      pushToast("error", "Device Registry Refused", err.message);
    } finally {
      setLoadingDevices(false);
    }
  };

  const fetchLogs = async (activeToken: string) => {
    try {
      setLoadingLogs(true);
      const l = await apiFetchLogs(activeToken);
      setAuditLogs(l);
    } catch (err: any) {
      pushToast("error", "Audit Logs Sync Failed", err.message || "Failed retrieving logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadAllEndpoints = (activeToken: string) => {
    fetchDashboardData(activeToken);
    fetchUsers(activeToken);
    fetchDevices(activeToken);
    fetchLogs(activeToken);
  };

  // 3. Socket Connection Lifecycle setup
  useEffect(() => {
    if (!token) return;

    // Connect to same host domain
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on("connect", () => {
      setGatewayStatus("connected");
      // Join the admin broadcast room for real-time log streaming
      socket.emit("join_admin_room");
      // Authenticate admin socket to join corresponding admin logs update broadcast channels
      socket.emit("authenticate_user", "admin_operator_account");
      pushToast("system", "Websocket Channel Secure", "Active dual-throw link established with standard Express node.");
    });

    socket.on("disconnect", () => {
      setGatewayStatus("disconnected");
    });

    // Subscribed WebSocket Events
    socket.on("system_update", (payload: { event: string; id: string }) => {
      // Trigger instant background payload refreshes so dashboards remain alive!
      fetchDashboardData(token);
      if (payload.event === "user_deleted") {
        setUsersList((prev) => prev.filter((u) => u.id !== payload.id));
        pushToast("system", "Remote State Updated", "User purged by concurrent operator channel.");
      }
      if (payload.event === "device_deleted") {
        setDevicesList((prev) => prev.filter((d) => d.id !== payload.id));
        pushToast("system", "Telemetry Stream Terminated", "Care IoT node disconnected remotely.");
      }
    });

    // Notifications broadcast trigger
    socket.on("receive_broadcast_message", (data: { message: string; sender: string }) => {
      pushToast("broadcast", "Global Alert Broadcasted", data.message);
      // Synchronize timeline payload automatically
      fetchDashboardData(token);
    });

    // Direct chat notifications callback
    socket.on("receive_direct_message", (data: { message: string; sender: string }) => {
      pushToast("direct", "Outgoing Dispatch Confirmed", data.message);
      fetchDashboardData(token);
    });

    socket.on("message_logged", (newLog) => {
      setDashboardData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messageHistory: [newLog, ...prev.messageHistory]
        };
      });
    });

    // Real-time log ingestion – prepend new log entry without full refetch
    socket.on("new_log", (incomingLog) => {
      setAuditLogs((prev) => [incomingLog, ...prev]);
      pushToast("system", "New Activity Logged", incomingLog.details || "A system event was recorded.");
    });

    return () => {
      socket.disconnect();
      setGatewayStatus("disconnected");
    };
  }, [token]);

  // Handle Initial Payload Trigger
  useEffect(() => {
    if (token) {
      loadAllEndpoints(token);
    }
  }, [token]);

  // 4. API Operations Form Handlers

  // Admin Logout action
  const handleLogout = () => {
    localStorage.removeItem("carehub_admin_token");
    setToken(null);
    setDashboardData(null);
    setUsersList([]);
    setDevicesList([]);
    pushToast("system", "Operator Deregistered", "Cleared all stored bearer authorization indexes from storage.");
  };

  // Demo Admin access quick-bypass setup has been moved to LoginPage

  // Deleting user profiles via DELETE /api/admin/users/:id
  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await deleteUser(userId, token);

      // Update local state directly
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      // Trigger payload refreshes
      fetchDashboardData(token);
      fetchDevices(token); // since deleting an owner triggers associated device updates

      pushToast("success", "Profile Record Purged", "The caregiver account has been completely wiped from registry.");
      return true;
    } catch (err: any) {
      pushToast("error", "Deletion Failed", err.message || "Failed removing profile record");
      return false;
    }
  };

  // Deleting device nodes via DELETE /api/admin/devices/:id
  const handleDeleteDevice = async (deviceId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await deleteDevice(deviceId, token);

      // Refresh state lists
      setDevicesList((prev) => prev.filter((d) => d.id !== deviceId));
      fetchDashboardData(token);
      fetchUsers(token); // user device count decreases

      pushToast("success", "IoT Node Unregistered", "Successfully discharged telemetry pulse from CareHub system.");
      return true;
    } catch (err: any) {
      pushToast("error", "Discharge Refused", err.message || "Failed unregistering device");
      return false;
    }
  };

  const handleCreateDevice = async (name: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await createDevice(name, token);

      // Refresh devices
      fetchDevices(token);
      fetchDashboardData(token);

      pushToast("success", "IoT Node Registered", `Successfully registered device "${name}".`);
      return true;
    } catch (err: any) {
      pushToast("error", "Registration Refused", err.message || "Failed creating device");
      return false;
    }
  };

  const handleDirectMessage = async (userId: string, content: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const feedback = await sendDirectMessage(userId, content, token);

      // Local tracking of timeline inserts
      if (feedback?.log) {
        setDashboardData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messageHistory: [feedback.log, ...prev.messageHistory]
          };
        });
      }

      pushToast("success", "Direct Signal Dispatched", `Socket text transmitted to targeting user card successfully.`);
      return true;
    } catch (err: any) {
      pushToast("error", "Dispatch Blocked", err.message || "Error sending socket text");
      return false;
    }
  };

  // Global broadcast command dispatch
  const handleGlobalBroadcast = async (content: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const feedback = await sendGlobalBroadcast(content, token);

      if (feedback?.log) {
        setDashboardData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messageHistory: [feedback.log, ...prev.messageHistory]
          };
        });
      }

      pushToast("success", "Global Broadcast Sent", "Signal successfully propagated across network sockets.");
      return true;
    } catch (err: any) {
      pushToast("error", "Broadcast Failed", err.message || "Error deploying broadcast signal");
      return false;
    }
  };

  // 5. Auth Login Shield Page render
  if (!token) {
    return (
      <LoginPage
        setToken={setToken}
        pushToast={pushToast}
        toasts={toasts}
        removeToast={removeToast}
      />
    );
  }

  // 6. MAIN AUTHENTICATED ADMINISTRATOR WORKSPACE
  return (
    <div id="admin-workspace-grid" className="min-h-screen flex flex-col md:flex-row bg-[#f3f4f6] dark:bg-[#050610] text-[#1e293b] dark:text-[#f8fafc] transition-colors duration-300 relative overflow-hidden z-0">

      {/* Frosted Glass Floating Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] min-w-[320px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[100px] md:blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] min-w-[280px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[100px] md:blur-[130px] pointer-events-none z-0" />

      {/* PERSISTENT SIDEBAR NAVIGATION (Left 260px wide) */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-3xl flex flex-col justify-between shrink-0 z-10 relative" id="admin-pane-sidebar">
        <div>

          {/* Brand header panel */}
          <div className="p-6 border-b border-solid border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight leading-none text-slate-955 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">HomeCareHub</h1>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Admin Dashboard</span>
              </div>
            </div>

            {/* Socket link heartbeat blinker */}
            <div
              title={gatewayStatus === "connected" ? "Live system link connected" : "Link dropped"}
              className={`p-1 rounded-full ${gatewayStatus === "connected" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                }`}
            >
              {gatewayStatus === "connected" ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Sidebar Menu selections */}
          <nav className="p-4 space-y-1.5" id="sidebar-tabs-navigation">
            {[
              { id: "dashboard", path: "/", label: "Intel Dashboard", icon: Grid },
              { id: "users", path: "/users", label: "User Directory", icon: Users },
              { id: "devices", path: "/devices", label: "IoT Node Registry", icon: Cpu },
              { id: "logs", path: "/logs", label: "Signal Timelines", icon: Terminal }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentTab === tab.id || (currentTab === "" && tab.id === "dashboard");
              return (
                <Link
                  key={tab.id}
                  id={`sidebar-tab-button-${tab.id}`}
                  to={tab.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl tracking-tight transition-all cursor-pointer ${isActive
                    ? "bg-white/60 dark:bg-white/10 border border-white/20 dark:border-white/10 text-indigo-600 dark:text-white font-bold shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/20 dark:hover:bg-white/5"
                    }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Global Broadcast widget button area at footer of sidebar */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 bg-white/20 dark:bg-white/[0.01]">

          <button
            id="broadcast-trigger-sidebar"
            onClick={() => setBroadcastOpen(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold tracking-tight shadow-md shadow-indigo-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Broadcast Signal
          </button>

          {/* Quick network details */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wide">
            <span>SOCKET GATEWAY</span>
            <span className="font-bold">{gatewayStatus.toUpperCase()}</span>
          </div>

        </div>

      </aside>

      {/* WORKSPACE CONTENT BODY (Right flex-1 filled) */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">

        {/* SLEEK GLASS TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-40 h-16 border-b border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/2 backdrop-blur-md px-6 flex items-center justify-between" id="workspace-top-bar">

          {/* Active section title display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Workspace</span>
            <CornerDownRight className="w-3 h-3 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest font-mono">
              / {currentTab || "dashboard"}
            </h2>
          </div>

          {/* Profile, modes & control keys panel align right */}
          <div className="flex items-center gap-3">



            {/* Quick status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${gatewayStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              API COMPLIANT
            </div>

            {/* Split Line divider */}
            <span className="h-6 w-px bg-black/10 dark:bg-white/10" />


            {/* Logout button */}
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              title="Close secure station"
              className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-rose-500/20 hover:border-rose-500 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </header>

        {/* WORKSPACE PAGES MOUNT HOOKS */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto" id="workspace-viewports-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Routes location={location}>
                <Route path="/" element={
                  <DashboardPage
                    loading={loadingDashboard}
                    data={dashboardData}
                    onNavigateToTab={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)}
                  />
                } />
                <Route path="/users" element={
                  <UsersPage
                    loading={loadingUsers}
                    users={usersList}
                    onDeleteUser={handleDeleteUser}
                    onSendMessage={handleDirectMessage}
                  />
                } />
                <Route path="/devices" element={
                  <DevicesPage
                    loading={loadingDevices}
                    devices={devicesList}
                    onDeleteDevice={handleDeleteDevice}
                    onCreateDevice={handleCreateDevice}
                  />
                } />
                <Route path="/logs" element={
                  <LogsPage
                    loading={loadingLogs}
                    auditLogs={auditLogs}
                  />
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* OVERLAY MODAL: GLOBAL SOCKET BROADS MESSAGE DISPATCH */}
      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onBroadcast={handleGlobalBroadcast}
      />

      {/* OVERLAY SYSTEM PORTALS TOAST BANNER CHANNELS */}
      <NotificationToast toasts={toasts} removeToast={removeToast} />

    </div>
  );
}
