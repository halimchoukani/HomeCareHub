import React, { useEffect, useRef, useState } from "react";
import { Send, Clock, UserCheck, Link, UserPlus, Cpu, Wifi } from "lucide-react";

interface LogsViewProps {
  loading: boolean;
  auditLogs: any[];
}

export default function LogsView({ loading, auditLogs }: LogsViewProps) {
  const [filter, setFilter] = useState<"all" | "account" | "device" | "person">("all");
  const [newLogIds, setNewLogIds] = useState<Set<number>>(new Set());
  const prevCountRef = useRef<number>(auditLogs.length);

  // Track newly arriving logs to flash them
  useEffect(() => {
    if (auditLogs.length > prevCountRef.current) {
      const added = auditLogs.slice(0, auditLogs.length - prevCountRef.current);
      const ids = new Set(added.map((l) => l.id));
      setNewLogIds(ids);
      const timer = setTimeout(() => setNewLogIds(new Set()), 4000);
      prevCountRef.current = auditLogs.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = auditLogs.length;
  }, [auditLogs.length]);

  const filteredHistory = auditLogs.filter((item) => {
    if (filter === "account") return item.action === "USER_CREATED";
    if (filter === "device") return item.action === "USER_JOINED_DEVICE";
    if (filter === "person") return item.action === "USER_ADDED_PERSON" || item.action === "USER_DELETED_PERSON";
    return true;
  });

  return (
    <div id="logs-view-panel" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">System Activity Logs</h2>
            {/* Live indicator */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
              <Wifi className="w-3 h-3 animate-pulse" />
              LIVE
            </span>
            {auditLogs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] font-bold">
                {auditLogs.length} events
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Historical registry of account creations, device links, and assigned personnel actions.</p>
        </div>

        {/* Quick Filter tabs */}
        <div className="flex bg-slate-500/5 p-1 rounded-xl border border-slate-200 dark:border-slate-800" id="logs-filter-group">
          {(["all", "account", "device", "person"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                filter === type
                  ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-500 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {type === "all" ? "All Logs" : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Main glass timelines */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Send className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p className="text-sm font-semibold">No activity logs recorded yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-150 dark:border-slate-800 pl-6 ml-3 space-y-6" id="logs-timeline-trail">
            {filteredHistory.map((log) => {
              const isAccount = log.action === "USER_CREATED";
              const isDevice = log.action === "USER_JOINED_DEVICE";
              const isDeletedPerson = log.action === "USER_DELETED_PERSON";
              const isNew = newLogIds.has(log.id);
              
              let badgeLabel = "Person Added";
              let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15";
              let BulletIcon = UserPlus;
              let iconColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

              if (isAccount) {
                badgeLabel = "Account Creation";
                badgeColor = "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15";
                BulletIcon = UserCheck;
                iconColor = "bg-violet-500/10 text-violet-500 border-violet-500/20";
              } else if (isDevice) {
                badgeLabel = "Device Joined";
                badgeColor = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15";
                BulletIcon = Link;
                iconColor = "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
              } else if (isDeletedPerson) {
                badgeLabel = "Person Removed";
                badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15";
                BulletIcon = Cpu;
                iconColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
              }

              return (
                <div
                  key={log.id}
                  className={`relative group transition-all duration-700 ${isNew ? "ring-1 ring-emerald-500/40 rounded-xl" : ""}`}
                  id={`log-item-${log.id}`}
                >
                  {/* New entry pulse marker */}
                  {isNew && (
                    <span className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase z-10 animate-pulse">
                      New
                    </span>
                  )}

                  {/* Outer bullet marker */}
                  <span className={`absolute -left-[31px] top-1.5 p-1.5 rounded-full z-10 border ${iconColor}`}>
                    <BulletIcon className="w-3.5 h-3.5" />
                  </span>

                  <div className={`p-4 rounded-xl border transition-all ${
                    isNew
                      ? "bg-emerald-500/[0.04] border-emerald-500/20 dark:border-emerald-500/20"
                      : "bg-slate-500/[0.03] hover:bg-slate-500/[0.06] border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-800"
                  }`}>
                    
                    {/* Header bar metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                        
                        {log.user && (
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Operator: <b className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">@{log.user.username}</b>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Content body message */}
                    <p className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 mt-3 whitespace-pre-wrap leading-relaxed">
                      {log.details}
                    </p>

                    {/* Operator Credit footer */}
                    {log.user && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Email: <b className="font-mono text-slate-600 dark:text-slate-300">{log.user.email}</b></span>
                        <span className="font-mono text-emerald-500 font-bold flex items-center gap-1">🟢 Verified Action</span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
