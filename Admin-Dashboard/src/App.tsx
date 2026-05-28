import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  ShieldAlert,
  Cpu,
  Users,
  Megaphone,
  LogOut,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Key,
  Lock,
  CornerDownRight,
  User,
  Compass,
  Terminal,
  Grid,
  BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";

import { DashboardPayload, User as TypeUser, Device as TypeDevice } from "./types";
import DashboardView from "./components/DashboardView";
import UsersView from "./components/UsersView";
import DevicesView from "./components/DevicesView";
import LogsView from "./components/LogsView";
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
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [customKey, setCustomKey] = useState("carehub_jwt_super_access_key_99");

  // Routing / View Tabs
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // Main payloads
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [usersList, setUsersList] = useState<TypeUser[]>([]);
  const [devicesList, setDevicesList] = useState<TypeDevice[]>([]);

  // Telemetry load toggles
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(true);

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
      const res = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      if (!res.ok) throw new Error("Credentials outdated or refused");
      const d = await res.json();
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
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      if (!res.ok) throw new Error("Failed syncing caregiver logs");
      const u = await res.json();
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
      const res = await fetch("/api/admin/devices", {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      if (!res.ok) throw new Error("Failed syncing devices registry");
      const dev = await res.json();
      setDevicesList(dev);
    } catch (err: any) {
      pushToast("error", "Device Registry Refused", err.message);
    } finally {
      setLoadingDevices(false);
    }
  };

  const loadAllEndpoints = (activeToken: string) => {
    fetchDashboardData(activeToken);
    fetchUsers(activeToken);
    fetchDevices(activeToken);
  };

  // 3. Socket Connection Lifecycle setup
  useEffect(() => {
    if (!token) return;

    // Connect to same host domain
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on("connect", () => {
      setGatewayStatus("connected");
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

  // Demo Admin access quick-bypass setup
  const handleLogin = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginUsername,
        password: loginPassword
      })
    });
    if (!res.ok) {
      pushToast("error", "Authentication Failed", "Credentials might be invalid.");
      return;
    }
    const data = await res.json();

    localStorage.setItem("carehub_admin_token", data.token);
    setToken(data.token);
    pushToast("success", "Authentication Approved", "Admin session generated automatically with high security clearance.");
  };

  // Deleting user profiles via DELETE /api/admin/users/:id
  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Database override refused delete requests.");

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
      const res = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Could not sever node endpoint connection.");

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
      const res = await fetch("/api/devices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error("Failed to register new IoT node.");

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

  // Direct socket chat messenger dispatch via POST /api/admin/message
  const handleDirectMessage = async (userId: string, content: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch("/api/admin/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, message: content })
      });
      if (!res.ok) throw new Error("Carrier dispatch failed reporting connection codes.");
      const feedback = await res.json();

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
      const res = await fetch("/api/admin/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: content }) // userId left blank for broad scope
      });
      if (!res.ok) throw new Error("Vanguard Broadcast node refused validation.");
      const feedback = await res.json();

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
      <div id="auth-shield-page" className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-900 text-slate-100 p-6">
        {/* Neon blur ambient circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

        <div className="relative w-full max-w-md" id="auth-card-block">

          {/* Header icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3 animate-pulse">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              HomeCareHub Operations
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Secondary Command & Telemetry Administration Gateway</p>
          </div>

          {/* Form container */}
          <div className="glass-panel backdrop-blur-3xl border border-white/5 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

            <div className="space-y-4">

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Clearance Operator Profile</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"

                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/5 text-slate-400 text-sm rounded-xl outline-none select-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gateway Safety Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"

                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/5 text-slate-500 text-sm rounded-xl outline-none select-none"
                  />
                </div>
              </div>


              <div className="pt-2">
                <button
                  id="demo-login-submit"
                  onClick={handleLogin}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 top-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold tracking-tight shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/45 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Sign In
                </button>
              </div>

            </div>
          </div>

          {/* Toast diagnostics */}
          <NotificationToast toasts={toasts} removeToast={removeToast} />
        </div>
      </div>
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
              { id: "dashboard", label: "Intel Dashboard", icon: Grid },
              { id: "users", label: "User Directory", icon: Users },
              { id: "devices", label: "IoT Node Registry", icon: Cpu },
              { id: "logs", label: "Signal Timelines", icon: Terminal }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sidebar-tab-button-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl tracking-tight transition-all cursor-pointer ${isActive
                    ? "bg-white/60 dark:bg-white/10 border border-white/20 dark:border-white/10 text-indigo-600 dark:text-white font-bold shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/20 dark:hover:bg-white/5"
                    }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
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
              / {currentTab}
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
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === "dashboard" && (
                <DashboardView
                  loading={loadingDashboard}
                  data={dashboardData}
                  onNavigateToTab={setCurrentTab}
                />
              )}

              {currentTab === "users" && (
                <UsersView
                  loading={loadingUsers}
                  users={usersList}
                  onDeleteUser={handleDeleteUser}
                  onSendMessage={handleDirectMessage}
                />
              )}

              {currentTab === "devices" && (
                <DevicesView
                  loading={loadingDevices}
                  devices={devicesList}
                  onDeleteDevice={handleDeleteDevice}
                  onCreateDevice={handleCreateDevice}
                />
              )}

              {currentTab === "logs" && (
                <LogsView
                  loading={loadingDashboard}
                  messageHistory={dashboardData?.messageHistory || []}
                />
              )}
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
