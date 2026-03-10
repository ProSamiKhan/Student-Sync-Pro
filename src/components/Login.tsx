import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = (import.meta as any).env.VITE_ADMIN_USERNAME || 'admin';
    const adminPass = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'password123';

    if (username === adminUser && password === adminPass) {
      localStorage.setItem('isLoggedIn', 'true');
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 space-y-8 border border-slate-100">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-100">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Sync Pro</h1>
            <p className="text-slate-500 font-medium">Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm transition-all focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm transition-all focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
            >
              SIGN IN 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Admin Access Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
