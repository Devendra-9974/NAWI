import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, login } = useAuth();

  const handleQuickSwitch = async (roleUsername: string) => {
    try {
      await login(roleUsername, 'password123');
    } catch (e) {
      console.error('Failed to switch user', e);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs / Active Context */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">National Legal Metrology</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold">OIML R 76 Evaluation Workspace</span>
      </div>

      {/* Center: Global Search Bar (as in Figma) */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-96 text-xs text-slate-600 focus-within:border-blue-500 focus-within:bg-white transition-all">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search evaluations, instruments, reports..."
          className="w-full bg-transparent focus:outline-none placeholder:text-slate-400 text-xs"
        />
        <kbd className="hidden lg:inline-block font-mono text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      {/* Right: Role Switcher, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Demo Switcher */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 text-xs">
          <button
            onClick={() => handleQuickSwitch('technician')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              user?.role === 'TECHNICIAN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tech
          </button>
          <button
            onClick={() => handleQuickSwitch('reviewer')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              user?.role === 'REVIEWER'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reviewer
          </button>
          <button
            onClick={() => handleQuickSwitch('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              user?.role === 'ADMIN'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          title="Notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || 'P'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.fullName || 'Priya Verma'}
            </span>
            <span className="text-[10px] text-slate-500 capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
