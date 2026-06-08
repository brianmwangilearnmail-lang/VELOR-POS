/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Tag, 
  Package, 
  Receipt, 
  RotateCcw, 
  Settings, 
  LogOut, 
  Dumbbell,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { UserAccount } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  lowStockCount: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  lowStockCount 
}: SidebarProps) {
  const isManager = currentUser.role === 'manager';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roleRestricted: true },
    { id: 'pos', label: 'New Sale / POS', icon: ShoppingCart, roleRestricted: false },
    { id: 'products', label: 'Products Master', icon: Tag, roleRestricted: false },
    { id: 'inventory', label: 'Inventory / FEFO', icon: Package, roleRestricted: false, badgeCount: lowStockCount },
    { id: 'receipts', label: 'Receipt History', icon: Receipt, roleRestricted: false },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, roleRestricted: true },
    { id: 'settings', label: 'POS Settings', icon: Settings, roleRestricted: true },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 font-sans text-slate-300">
      
      {/* Brand area */}
      <div className="p-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-teal-500/10 border border-teal-500/30 rounded-lg flex items-center justify-center text-teal-400">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-tight leading-none uppercase">
              Velor <span className="text-teal-400">POS</span>
            </h2>
            <span className="text-[10px] text-teal-500 font-mono tracking-wider uppercase font-semibold">
              Supplements
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isRestricted = item.roleRestricted && !isManager;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              disabled={isRestricted}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-medium relative group ${
                isRestricted
                  ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                  : isActive
                  ? 'bg-gradient-to-r from-teal-500/10 to-teal-500/5 text-teal-300 border-l-2 border-teal-400 pl-2.5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 shrink-0 ${
                  isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400'
                }`} />
                <span>{item.label}</span>
              </div>

              {/* Badges */}
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold">
                  {item.badgeCount}
                </span>
              ) : null}

              {isRestricted ? (
                <ShieldAlert className="h-3.5 w-3.5 text-slate-600 mr-1" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User profile card & Logout */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50">
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              isManager ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
            }`}>
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate mt-1">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
              isManager 
                ? 'bg-indigo-950/65 text-indigo-400 border border-indigo-950' 
                : 'bg-teal-950/65 text-teal-400 border border-teal-950'
            }`}>
              {currentUser.role}
            </span>
            <span className="text-[9px] text-slate-600 font-mono">
              Terminal #01
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-red-950/20 hover:text-red-400 text-slate-400 text-xs font-medium rounded-xl border border-slate-800 hover:border-red-900/35 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}
