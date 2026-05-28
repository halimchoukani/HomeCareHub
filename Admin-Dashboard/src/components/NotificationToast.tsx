import React from "react";
import { X, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastItem {
  id: string;
  type: "broadcast" | "direct" | "system" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export default function NotificationToast({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div id="toast-portal-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgClass = "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200";
          let icon = <Bell className="w-5 h-5 text-indigo-500" />;
          let accentBar = "bg-indigo-500";

          switch (toast.type) {
            case "broadcast":
              bgClass = "bg-slate-900/90 text-white border-violet-500/30 backdrop-blur-md";
              icon = <Bell className="w-5 h-5 text-violet-400 animate-pulse" />;
              accentBar = "bg-gradient-to-r from-violet-500 to-fuchsia-500";
              break;
            case "direct":
              bgClass = "bg-slate-900/90 text-white border-cyan-500/30 backdrop-blur-md";
              icon = <Info className="w-5 h-5 text-cyan-400 animate-bounce" />;
              accentBar = "bg-cyan-400";
              break;
            case "success":
              bgClass = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200";
              icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
              accentBar = "bg-emerald-500";
              break;
            case "error":
              bgClass = "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200";
              icon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
              accentBar = "bg-rose-500";
              break;
            case "system":
              bgClass = "bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-200";
              icon = <Info className="w-5 h-5 text-sky-500" />;
              accentBar = "bg-sky-500";
              break;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-xl ${bgClass}`}
              id={`toast-item-${toast.id}`}
            >
              {/* Top Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${accentBar}`} />

              <div className="mt-1 flex-shrink-0">{icon}</div>

              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-mono opacity-50 mb-0.5">
                  {toast.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
                <h4 className="text-sm font-semibold tracking-tight leading-snug">{toast.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed break-words">{toast.message}</p>
              </div>

              <button
                id={`toast-dismiss-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
