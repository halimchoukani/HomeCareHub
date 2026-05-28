import React, { useState } from "react";
import { User } from "../types";
import { Search, ShieldAlert, ShieldCheck, Mail, Calendar, Trash2, MessageSquare, AlertTriangle, Send, ShieldPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UsersViewProps {
  loading: boolean;
  users: User[];
  onDeleteUser: (userId: string) => Promise<boolean>;
  onSendMessage: (userId: string, content: string) => Promise<boolean>;
}

export default function UsersView({ loading, users, onDeleteUser, onSendMessage }: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdminFilter, setIsAdminFilter] = useState<"all" | "admin" | "user">("all");

  // State for deletes confirmation modal
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for direct message modal
  const [messageModalUser, setMessageModalUser] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (isAdminFilter === "admin") return matchesSearch && u.isAdmin;
    if (isAdminFilter === "user") return matchesSearch && !u.isAdmin;
    return matchesSearch;
  });

  const handleDeleteTrigger = (user: User) => {
    setDeleteModalUser(user);
  };

  const confirmDelete = async () => {
    if (!deleteModalUser) return;
    setIsDeleting(true);
    const success = await onDeleteUser(deleteModalUser.id);
    setIsDeleting(false);
    if (success) {
      setDeleteModalUser(null);
    }
  };

  const handleMessageTrigger = (user: User) => {
    setMessageModalUser(user);
    setMessageContent("");
  };

  const sendMessage = async () => {
    if (!messageModalUser || !messageContent.trim()) return;
    setIsSendingMessage(true);
    const success = await onSendMessage(messageModalUser.id, messageContent);
    setIsSendingMessage(false);
    if (success) {
      setMessageModalUser(null);
    }
  };

  return (
    <div id="users-view-panel" className="space-y-6">
      
      {/* Title Header and Summary Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Active User Directory</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Edit profiles, deploy security clearance flags, monitor associated IoT nodes count and sync states.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase font-mono">Matched Accounts:</span>
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold font-mono rounded-lg text-xs">
            {filteredUsers.length} / {users.length}
          </span>
        </div>
      </div>

      {/* Modern Search Filters panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-3xl glass-panel">
        
        {/* Search input */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="user-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username or caregiver email address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-500/5 focus:bg-transparent border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>

        {/* Filters dropdown custom styling tabs */}
        <div className="flex bg-slate-500/5 p-1 rounded-xl border border-slate-200 dark:border-slate-800" id="admin-filters-tab-group">
          {(["all", "admin", "user"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setIsAdminFilter(filter)}
              className={`flex-1 text-center text-xs font-bold py-2 rounded-lg transition-all capitalize cursor-pointer ${
                isAdminFilter === filter
                  ? "bg-white dark:bg-slate-900 shadow-md text-indigo-500 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {filter === "all" ? "All Profiles" : filter}
            </button>
          ))}
        </div>

      </div>

      {/* Grid List Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80">
        
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
                <div className="w-16 h-8 bg-slate-100 dark:bg-slate-900 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <span className="font-semibold text-sm">No profiles found matching search filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="users-data-table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-500/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Role / Username</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Associated IoT Nodes</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Clearance Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Care Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-sm text-slate-700 dark:text-slate-300">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-500/5 group transition-colors" id={`user-row-${user.id}`}>
                    
                    {/* User profile with custom badges */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 text-indigo-500 border border-indigo-500/10 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <p id={`user-row-username-${user.id}`} className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 leading-snug">
                            {user.username}
                            {user.isAdmin && (
                              <span className="text-emerald-500" title="System Administrator">
                                <ShieldCheck className="w-4 h-4" />
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">
                            {user.isAdmin ? "Platform Admin" : "Primary Caregiver"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email column */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 opacity-60" />
                        {user.email}
                      </span>
                    </td>

                    {/* Node count */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`w-2 h-2 rounded-full ${user.deviceCount > 0 ? "bg-cyan-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`} />
                        <span className="font-bold">{user.deviceCount}</span>
                        <span className="text-xs text-slate-400 opacity-80">linked devices</span>
                      </div>
                    </td>

                    {/* Join/Clearance Date */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        {user.joinDate}
                      </span>
                    </td>

                    {/* Action Panel alignment right */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Direct messaging modal trigger button */}
                        <button
                          id={`user-msg-btn-${user.id}`}
                          onClick={() => handleMessageTrigger(user)}
                          title="Direct socket text broadcast"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/5 transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Profile removal button */}
                        <button
                          id={`user-delete-btn-${user.id}`}
                          onClick={() => handleDeleteTrigger(user)}
                          title="Purge profile data"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: PREMUM FLIGHT HOVERING LOG DELETE MODAL */}
      <AnimatePresence>
        {deleteModalUser && (
          <div id="delete-user-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalUser(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Glass Container */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl z-10 border border-slate-200 dark:border-slate-800"
            >
              
              <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 animate-pulse" />
                <h3 className="font-bold text-sm">Destructive Profile Removal Operation</h3>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Purge primary profile associated with <span className="font-mono text-rose-500">"{deleteModalUser.username}"</span>?
              </h4>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                This is a critical system operator override. Purging will immediately disconnect their IoT nodes count ({deleteModalUser.deviceCount} registered devices) and delete all associated telemetry indexes from the database permanently.
              </p>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  id="cancel-delete-modal-btn"
                  onClick={() => setDeleteModalUser(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-modal-btn"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Purging Record..." : "Confirm Purge"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DIRECT DIALOG MESSAGE MODAL */}
      <AnimatePresence>
        {messageModalUser && (
          <div id="message-user-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMessageModalUser(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Glass Container */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl z-10 border border-slate-200 dark:border-slate-800"
            >
              
              <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4">
                <Send className="w-5 h-5 flex-shrink-0 text-indigo-500 animate-pulse" />
                <h3 className="font-bold text-sm">Direct Caregiver Chat Broadcast</h3>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Addressing Socket to caregiver <span className="font-mono text-indigo-500">@{messageModalUser.username}</span>
              </h4>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Use this connection to instantly trigger high-alert notifications on the targeted CareHub mobile app or ambient gateway hub.
              </p>

              {/* Message inputs form */}
              <div className="mt-4 space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Write Socket Message</label>
                <textarea
                  id="direct-message-text-area"
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="e.g., Warning: High heart rate incident detected. Please evaluate patient state immediately or call local responders."
                  className="w-full p-4 bg-slate-500/5 focus:bg-transparent border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-6">
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  SOCKET ALIVE
                </div>

                <div className="flex gap-2">
                  <button
                    id="cancel-message-modal-btn"
                    onClick={() => setMessageModalUser(null)}
                    disabled={isSendingMessage}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    id="submit-message-modal-btn"
                    onClick={sendMessage}
                    disabled={isSendingMessage || !messageContent.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingMessage ? "Dispatching..." : "Transmit Signal"}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
