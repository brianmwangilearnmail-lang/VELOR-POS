/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dumbbell, Shield, User, Lock, Activity } from 'lucide-react';
import { UserAccount } from '../types';
import { DEMO_USERS } from '../data';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'cashier' | 'manager'>('cashier');

  const handleDemoLogin = (user: UserAccount) => {
    onLoginSuccess(user);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please fill in the username field.');
      return;
    }
    
    // Simple mock matches for ease of use
    const matchedUser = DEMO_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser);
    } else {
      // Allow fallback creation or standard direct demo match
      const fallbackUser: UserAccount = {
        id: 'u_custom_' + Date.now().toString(),
        name: username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Custom User',
        role: selectedRole,
        username: username.toLowerCase().trim()
      };
      onLoginSuccess(fallbackUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 bg-teal-500/15 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400 mb-3 shadow-inner">
            <Dumbbell className="h-7 w-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">
            VELOR <span className="text-teal-400 font-medium">POS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Professional Supplement Shop Retail Management System
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 rounded-lg text-xs leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 transition-all font-sans text-sm"
                placeholder="e.g. alex_cashier or sara_manager"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 transition-all font-sans text-sm"
                placeholder="•••••••• (any password to test)"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Role for Custom Login
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('cashier')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'cashier'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Activity className="h-3 w-3" />
                Cashier Role
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('manager')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'manager'
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="h-3 w-3" />
                Manager Role
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-semibold rounded-xl text-sm transition-all focus:outline-none hover:shadow-lg focus:ring-2 focus:ring-teal-400/40"
          >
            Enter Store Terminal
          </button>
        </form>

        {/* Speed Login Section */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="text-center mb-4">
            <span className="bg-slate-950 px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Quick Admin Demo Roles
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DEMO_USERS.map((user) => {
              const isManager = user.role === 'manager';
              return (
                <button
                  key={user.id}
                  onClick={() => handleDemoLogin(user)}
                  className={`group text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isManager
                      ? 'border-indigo-900/40 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-600/60'
                      : 'border-teal-900/40 bg-slate-900/50 hover:bg-slate-900 hover:border-teal-600/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-slate-200 group-hover:text-slate-100">
                      {user.name}
                    </span>
                    {isManager ? (
                      <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-teal-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{user.username}</span>
                    <span className={`px-1.5 py-0.2 rounded font-medium text-[9px] uppercase ${
                      isManager ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-teal-950 text-teal-400 border border-teal-900'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Small Footer Notice */}
        <div className="text-center text-[11px] text-slate-600 mt-6">
          Velor POS v1.0.0 — Compliant & Secure Cash Register Engine
        </div>
      </div>
    </div>
  );
}
