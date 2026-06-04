import React from "react";
import { Users, Cpu, Activity, AlertCircle, TrendingUp, CheckCircle, Flame, ShieldAlert, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { motion } from "motion/react";
import { DashboardPayload } from "../types";

interface DashboardViewProps {
  loading: boolean;
  data: DashboardPayload | null;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ loading, data, onNavigateToTab }: DashboardViewProps) {
  if (loading || !data) {
    return (
      <div id="dashboard-skeleton-grid" className="space-y-6">
        {/* Metric Cards Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl animate-pulse space-y-3 relative overflow-hidden">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl animate-pulse h-96">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
            <div className="w-full h-72 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
          </div>
          <div className="glass-panel p-6 rounded-3xl animate-pulse h-96">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
            <div className="w-full h-72 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, deviceStatuses, registrationsOverTime, alerts } = data;

  const totalDeviceCount = deviceStatuses.online + deviceStatuses.warning + deviceStatuses.offline;

  // Pie chart formatted data
  const pieData = [
    { name: "Online Devices", value: deviceStatuses.online, color: "#10b981" },
    { name: "Warning / Low Bat", value: deviceStatuses.warning, color: "#f59e0b" },
    { name: "Offline", value: deviceStatuses.offline, color: "#f43f5e" }
  ];

  return (
    <div id="active-dashboard-container" className="space-y-6">
      {/* Top Banner Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-transparent border border-blue-500/10 dark:border-blue-500/5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">CareHub Command Intel</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time status updates from active smart trackers, heart rate monitors, and patient emergency links.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-full self-start md:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          GATEWAY SECURE
        </div>
      </div>

      {/* Grid of Dynamic Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Metric 1 */}
        <motion.div
          onClick={() => onNavigateToTab("users")}
          whileHover={{ y: -3, scale: 1.01 }}
          className="group relative cursor-pointer glass-panel p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:border-indigo-500/20"
          id="stat-card-users"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-violet-500 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Registered Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">{metrics.totalUsers}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-bold font-mono">+18%</span>
            <span>growth this month</span>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          onClick={() => onNavigateToTab("devices")}
          whileHover={{ y: -3, scale: 1.01 }}
          className="group relative cursor-pointer glass-panel p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 dark:hover:border-cyan-500/20"
          id="stat-card-devices"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 to-blue-500 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active IoT Devices</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">{metrics.totalDevices}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-cyan-500 font-bold font-mono">{deviceStatuses.online} / {totalDeviceCount}</span>
            <span>devices online now</span>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="group relative glass-panel p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:border-emerald-500/20"
          id="stat-card-persons"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-500 to-teal-500 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Persons Monitored</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">{metrics.totalPersons}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="text-emerald-500 font-bold font-mono">{metrics.activePersons} Active</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400 font-mono">{metrics.inactivePersons} Inactive</span>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="group relative glass-panel p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5 dark:hover:border-rose-500/20"
          id="stat-card-alerts"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-500 to-amber-500 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Alerts</p>
              <h3 className="text-3xl font-bold text-rose-500 mt-1.5 font-mono">{metrics.activeAlerts}</h3>
            </div>
            <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${metrics.activeAlerts > 0 ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {metrics.activeAlerts > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="text-rose-500 font-bold">Action required</span>
                <span>telemetry disconnects</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Status pristine</span>
                <span>all links reliable</span>
              </>
            )}
          </div>
        </motion.div>

      </div>

      {/* Charts & Alerts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Registration Charts (Left - 2/3 wide) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between" id="chart-growth-panel">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Active Growth & Telemetry Trends</h4>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Historical overview of platform growth alongside warning logs volume.</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-slate-500">
                JSON DB ACTIVE
              </span>
            </div>

            {/* Recharts Container */}
            <div className="h-64 sm:h-72 w-full mt-2" id="recharts-registration-growth">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={registrationsOverTime}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Area name="Staff/Users Accounts" type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area name="IoT Smart Nodes" type="monotone" dataKey="devices" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDevices)" />
                  <Area name="System Incident Flags" type="monotone" dataKey="alerts" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Status Distributions (Right - 1/3 wide) */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between" id="chart-status-panel">
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Device Reliability Index</h4>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Distribution of telemetry heartbeat link qualities.</p>

            {/* Recharts Pie */}
            <div className="h-56 w-full relative flex items-center justify-center mt-4" id="recharts-device-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner core display */}
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-white font-mono">{totalDeviceCount}</span>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Nodes</p>
              </div>
            </div>
          </div>

          {/* Key Legend Cards */}
          <div className="space-y-2 mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">{item.value} ({Math.round((item.value / totalDeviceCount) * 100)}%)</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Alerts Feed and Historical Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Alerts Center Feed (Left 2/3) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl" id="alarms-monitoring-feed">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Active Patient Safety Incidents</h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Critical triggers and sensor drops needing immediate caregiver notifications.</p>
            </div>
            <div className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              LIVE TELEMETRY
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <div className="text-center p-8 text-sm text-slate-400">All alerts resolved successfully.</div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-900/30 ${alert.type === "critical"
                    ? "bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-200"
                    : alert.type === "warning"
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-200"
                      : "bg-sky-500/5 border-sky-500/20 text-sky-800 dark:text-sky-200"
                    }`}
                  id={`dashboard-alert-feed-${alert.id}`}
                >
                  <span className={`p-2 rounded-lg ${alert.type === "critical" ? "bg-rose-500/10 text-rose-500" : alert.type === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-sky-500/10 text-sky-500"
                    }`}>
                    {alert.type === "critical" ? <ShieldAlert className="w-4.5 h-4.5" /> : alert.type === "warning" ? <AlertCircle className="w-4.5 h-4.5" /> : <Activity className="w-4.5 h-4.5" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="text-xs font-extrabold uppercase tracking-wide opacity-80 font-mono">
                        {alert.type} TRIGGERED
                      </h5>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium font-mono">{alert.age}</span>
                    </div>
                    <p className="text-sm font-semibold tracking-tight mt-1">{alert.msg}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Origin Profile: <span className="font-mono bg-black/5 dark:bg-white/15 px-1 py-0.5 rounded">{alert.source}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Broadcast History feeds */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between" id="broadcasts-history-log">
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Admin Broadcast History</h4>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Logs of recent announcements dispatched via sockets.</p>

            <div className="space-y-4 mt-4 max-h-72 overflow-y-auto pr-1">
              {data.messageHistory && data.messageHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-mono opacity-50 mb-1">
                    <span>to {item.target}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed truncate">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => onNavigateToTab("logs")}
              className="w-full text-center text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 transition-colors py-2 block cursor-pointer"
            >
              View Full Send Logs →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
