import React, { useState } from "react";
import { Device } from "../types";
import { Search, Radio, Wifi, ShieldAlert, Cpu, User, Link, Trash2, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DevicesViewProps {
  loading: boolean;
  devices: Device[];
  onDeleteDevice: (deviceId: string) => Promise<boolean>;
  onCreateDevice: (name: string) => Promise<boolean>;
}

export default function DevicesView({ loading, devices, onDeleteDevice, onCreateDevice }: DevicesViewProps) {
  console.log(devices);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "warning" | "offline">("all");

  const [deleteModalDevice, setDeleteModalDevice] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteTrigger = (dev: Device) => {
    setDeleteModalDevice(dev);
  };

  const confirmDelete = async () => {
    if (!deleteModalDevice) return;
    setIsDeleting(true);
    const success = await onDeleteDevice(deleteModalDevice.id);
    setIsDeleting(false);
    if (success) {
      setDeleteModalDevice(null);
    }
  };

  const handleCreate = async () => {
    if (!newDeviceName.trim()) return;
    setIsCreating(true);
    const success = await onCreateDevice(newDeviceName.trim());
    setIsCreating(false);
    if (success) {
      setCreateModalOpen(false);
      setNewDeviceName("");
    }
  };

  return (
    <div id="devices-view-panel" className="space-y-6">

      {/* Header and counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">IoT Care Node Registry</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Control, calibrate, or detach health telemetry devices and wearable transmitters monitoring elder health stats.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase font-mono">Monitored Nodes:</span>
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 font-bold font-mono rounded-lg text-xs">
              {filteredDevices.length} / {devices.length}
            </span>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl text-xs font-bold tracking-tight shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            + Register Node
          </button>
        </div>
      </div>

      {/* Modern Search Filters panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-3xl glass-panel">

        {/* Search Input field */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="devices-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by device type, model ID, or owner username..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-500/5 focus:bg-transparent border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>

        {/* Custom status filter select block */}
        <div className="relative flex items-center">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
          </span>
          <select
            id="device-status-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-500/5 focus:bg-transparent border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl text-sm outline-none transition-all text-slate-800 dark:text-slate-100 font-medium cursor-pointer appearance-none"
          >
            <option value="all">All Telemetry Qualities</option>
            <option value="online">Online (Excellent Signal)</option>
            <option value="warning">Warnings (Low Battery, etc.)</option>
            <option value="offline">Offline (No Ping Response)</option>
          </select>
          <span className="absolute right-3.5 pointer-events-none text-slate-400">▼</span>
        </div>

      </div>

      {/* Main Grid Table List of devices */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80">

        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
                <div className="w-16 h-8 bg-slate-100 dark:bg-slate-900 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <span className="font-semibold text-sm">No IoT nodes found matching search filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="devices-data-table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-500/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Node Diagnostic</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Associated Profile</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Registered Persons</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Device Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Service Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-sm text-slate-700 dark:text-slate-300">
                {filteredDevices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-500/5 group transition-colors" id={`device-row-${dev.id}`}>

                    {/* Device details & generic title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white ${dev.status === "online"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                          : dev.status === "warning"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/15"
                          }`}>
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p id={`device-row-name-${dev.id}`} className="font-semibold text-slate-900 dark:text-white leading-snug">
                            {dev.name}
                          </p>
                          <span className="text-[10px] uppercase font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                            {dev.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Associated Caregiver owner */}
                    <td className="px-6 py-4">
                      {dev?.user ? (
                        <div className="text-slate-700 dark:text-slate-300">
                          <p className="font-bold text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            @{dev?.user?.username}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{dev?.user?.email}</p>
                        </div>
                      ) : (
                        <div className="text-slate-700 dark:text-slate-300">
                          <p className="font-bold text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            No Caregiver
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">No caregiver is associated with this device</p>
                        </div>
                      )}
                    </td>

                    {/* Model Spec */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {dev._count.persons}
                      </span> Registered Persons
                    </td>

                    {/* Signal / Battery Health Indicators */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold border">
                        {dev.status === "online" ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.05] border-emerald-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Connected
                          </span>
                        ) : dev.status === "warning" ? (
                          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/[0.05] border-amber-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low Battery
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/[0.05] border-rose-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Offline
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 font-mono tracking-tight">{dev._count.persons} Person monitored</p>
                    </td>

                    {/* Device Disconnect delete control button alignment right */}
                    <td className="px-6 py-4 text-right">
                      <button
                        id={`device-delete-btn-${dev.id}`}
                        onClick={() => handleDeleteTrigger(dev)}
                        title="Unregister IoT device"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DISCONNECT CONFIRMATION SYSTEM MODAL */}
      <AnimatePresence>
        {deleteModalDevice && (
          <div id="delete-device-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalDevice(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal glass layout */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl z-10 border border-slate-200 dark:border-slate-800"
            >

              <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <h3 className="font-bold text-sm">Discharge Node and Disconnect Telemetry</h3>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Sever connection to <span className="font-mono text-rose-500">"{deleteModalDevice.name}"</span>?
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Disconnecting this node ({deleteModalDevice.id}) immediately halts physical patient monitoring. The device data stream index will be detached from caregiver <b className="font-mono text-slate-700 dark:text-slate-300">@{deleteModalDevice.ownerUsername}</b>.
              </p>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  id="cancel-device-delete-btn"
                  onClick={() => setDeleteModalDevice(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  Retain Connection
                </button>
                <button
                  id="confirm-device-delete-btn"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Disconnecting..." : "Sever Node Link"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE DEVICE MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div id="create-device-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal glass layout */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl z-10 border border-slate-200 dark:border-slate-800"
            >

              <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl mb-4">
                <Cpu className="w-5 h-5 flex-shrink-0 text-cyan-500" />
                <h3 className="font-bold text-sm">Register New IoT Node</h3>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2">
                Node Identity
              </h4>

              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="Enter node name (e.g. Living Room Monitor)"
                className="w-full px-4 py-2.5 bg-slate-500/5 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl text-sm outline-none transition-all text-slate-800 dark:text-slate-100 font-medium mb-2"
                autoFocus
              />

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newDeviceName.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/10 hover:shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Registering..." : "Register Node"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
