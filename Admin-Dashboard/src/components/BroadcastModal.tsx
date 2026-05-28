import React, { useState } from "react";
import { Megaphone, X, Send, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (message: string) => Promise<boolean>;
}

export default function BroadcastModal({ isOpen, onClose, onBroadcast }: BroadcastModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    const success = await onBroadcast(message);
    setIsSending(false);
    if (success) {
      setMessage("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="global-broadcast-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal layout panel */}
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            className="relative w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl z-20 border border-slate-200 dark:border-slate-800"
          >
            
            {/* Header branding */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/15">
                  <Megaphone className="w-5 h-5 animate-bounce" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">Emergency Socket Broadcast</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Transmit to all active CareHub nodes</p>
                </div>
              </div>

              <button
                id="close-broadcast-modal"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              <div className="flex items-start gap-3 p-3 bg-violet-500/10 border border-violet-500/15 rounded-xl text-violet-800 dark:text-violet-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-violet-500 mt-0.5" />
                <p className="text-xs leading-relaxed font-semibold">
                  This warning message will immediately display as an urgent notification banner on every active caregiver screen and smart dashboard connected to the platform ecosystem.
                </p>
              </div>

              {/* textarea */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Announcement / Dispatch Text</label>
                <textarea
                  id="broadcast-message-text-area"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type an announcement to broadcast, e.g. 'Notice: Atmospheric heatwave warning. Monitor blood hydration ratios and activate smart ventilation systems on all elder care MAT channels.'"
                  required
                  className="w-full p-4 bg-slate-500/5 focus:bg-transparent border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100 font-medium leading-relaxed"
                />
              </div>

              {/* Controls footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  🌐 Target: All Devices ( userId = null )
                </span>

                <div className="flex gap-2">
                  <button
                    id="cancel-broadcast-btn"
                    type="button"
                    onClick={onClose}
                    disabled={isSending}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-broadcast-btn"
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? "Broadcasting..." : "Dispatch Announcement"}
                  </button>
                </div>
              </div>

            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
