import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, User as UserIcon, Shield, ArrowRightLeft } from 'lucide-react';

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
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Lab Branding */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Scale size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight">LegalMetrix</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                OIML R 76
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {user?.laboratoryName || 'National Legal Metrology Evaluation Centre'}
            </p>
          </div>
        </div>

        {/* Center: Demo Quick Switcher */}
        <div className="hidden md:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
            <ArrowRightLeft size={12} /> Demo Role:
          </span>
          <button
            onClick={() => handleQuickSwitch('technician')}
            className={`px-2.5 py-1 rounded transition ${
              user?.role === 'TECHNICIAN'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Technician
          </button>
          <button
            onClick={() => handleQuickSwitch('reviewer')}
            className={`px-2.5 py-1 rounded transition ${
              user?.role === 'REVIEWER'
                ? 'bg-purple-600 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Reviewer
          </button>
          <button
            onClick={() => handleQuickSwitch('admin')}
            className={`px-2.5 py-1 rounded transition ${
              user?.role === 'ADMIN'
                ? 'bg-emerald-600 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-right">
            <div>
              <p className="text-sm font-medium text-slate-200">{user?.fullName}</p>
              <div className="flex items-center justify-end gap-1">
                <Shield size={10} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold uppercase">{user?.role}</span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
              <UserIcon size={18} />
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
