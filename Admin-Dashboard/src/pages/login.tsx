import React, { useState } from "react";
import { Activity, User, Lock } from "lucide-react";
import { loginAdmin } from "../api/auth";
import NotificationToast, { ToastItem } from "../components/NotificationToast";

interface LoginPageProps {
  setToken: (token: string) => void;
  pushToast: (type: "broadcast" | "direct" | "system" | "success" | "error", title: string, message: string) => void;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export default function LoginPage({ setToken, pushToast, toasts, removeToast }: LoginPageProps) {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginAdmin(loginUsername, loginPassword);
      localStorage.setItem("carehub_admin_token", data.token);
      setToken(data.token);
      pushToast("success", "Authentication Approved", "Admin session generated automatically with high security clearance.");
    } catch (error: any) {
      pushToast("error", "Authentication Failed", "Credentials might be invalid.");
    }
  };

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
