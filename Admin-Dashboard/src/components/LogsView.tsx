import React, { useState } from "react";
import { MessageLog } from "../types";
import { Send, LayoutGrid, Radio, MessageSquare, Clock, Globe, UserCheck, ShieldClose } from "lucide-react";

interface LogsViewProps {
  loading: boolean;
  messageHistory: MessageLog[];
}

export default function LogsView({ loading, messageHistory }: LogsViewProps) {
  const [filter, setFilter] = useState<"all" | "broadcast" | "direct">("all");

  const filteredHistory = messageHistory.filter((item) => {
    if (filter === "broadcast") return item.type === "broadcast";
    if (filter === "direct") return item.type === "direct";
    return true;
  });

  return (
    <div id="logs-view-panel" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Socket Signal Dispatch Log</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Historical registry of all real-time notifications, instructions, and hazard warnings transmitted to patients.</p>
        </div>

        {/* Quick Filter tabs */}
        <div className="flex bg-slate-500/5 p-1 rounded-xl border border-slate-200 dark:border-slate-800" id="logs-filter-group">
          {(["all", "broadcast", "direct"] as const).map((type) => (
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
            <p className="text-sm font-semibold">No socket logs recorded yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-150 dark:border-slate-800 pl-6 ml-3 space-y-6" id="logs-timeline-trail">
            {filteredHistory.map((log) => {
              const isBroadcast = log.type === "broadcast";
              return (
                <div key={log.id} className="relative group" id={`log-item-${log.id}`}>
                  
                  {/* Outer bullet marker */}
                  <span className={`absolute -left-[31px] top-1.5 p-1.5 rounded-full z-10 border ${
                    isBroadcast 
                      ? "bg-violet-500/10 text-violet-500 border-violet-500/20" 
                      : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                  }`}>
                    {isBroadcast ? <Globe className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  </span>

                  <div className="p-4 rounded-xl bg-slate-500/[0.03] hover:bg-slate-500/[0.06] border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                    
                    {/* Header bar metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          isBroadcast 
                            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15" 
                            : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15"
                        }`}>
                          {log.type}
                        </span>
                        
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Target: <b className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{log.target}</b>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {/* Content body message */}
                    <p className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 mt-3 whitespace-pre-wrap leading-relaxed">
                      {log.content}
                    </p>

                    {/* Operator Credit footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Operator Account: <b className="font-mono text-slate-600 dark:text-slate-300">{log.sender}</b></span>
                      <span className="font-mono text-emerald-500 font-bold flex items-center gap-1">🟢 SENT via Websocket Gateway</span>
                    </div>

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
