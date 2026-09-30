import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  LogOut,
  User as UserIcon,
  Shield,
  Activity,
  LayoutDashboard,
  Layers,
  FlaskConical,
  FileCheck2,
  BookOpen,
  FileText,
  History,
  Users as UsersIcon,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, login, isAdmin } = useAuth();

  const handleQuickSwitch = async (roleUsername: string) => {
    try {
      await login(roleUsername, 'password123');
    } catch (e) {
      console.error('Failed to switch user', e);
    }
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/instruments', label: 'Instruments', icon: Layers },
    { to: '/tests/new', label: 'Test Wizard', icon: FlaskConical },
    { to: '/tests', label: 'Evaluations', icon: FileCheck2 },
    { to: '/rules', label: 'Rule Engine', icon: BookOpen },
    { to: '/repository', label: 'Reports', icon: FileText },
    { to: '/audit-logs', label: 'Audit Trail', icon: History },
    ...(isAdmin ? [{ to: '/users', label: 'Lab Staff', icon: UsersIcon }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-container shadow-[0_1px_8px_rgba(0,35,111,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Tier: Logo, Lab Sensors & Profile */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Lab Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Scale size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-lg font-bold text-primary tracking-tight">
                  METROLOGIX
                </span>
                <span className="font-label-caps text-[10px] uppercase bg-surface-container text-primary font-bold px-1.5 py-0.5 rounded border border-surface-variant">
                  NAWI
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium tracking-tight">
                {user?.laboratoryName || 'National Legal Metrology Evaluation Centre'} • OIML R 76
              </span>
            </div>
          </div>

          {/* Center: Live ISO/IEC 17025 Sensor Pill */}
          <div className="hidden lg:flex items-center gap-2.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold text-on-surface">
              Sensors Live
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              T: <span className="font-semibold text-on-surface">20.4°C</span>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              RH: <span className="font-semibold text-on-surface">48.2%</span>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              P: <span className="font-semibold text-on-surface">1013.2 hPa</span>
            </span>
            <span className="font-label-caps text-[9px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
              ISO 17025 OK
            </span>
          </div>

          {/* Right: Demo Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="hidden md:flex items-center bg-surface-container-low rounded-lg p-1 border border-surface-container text-xs">
              <button
                onClick={() => handleQuickSwitch('technician')}
                className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                  user?.role === 'TECHNICIAN'
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Technician
              </button>
              <button
                onClick={() => handleQuickSwitch('reviewer')}
                className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                  user?.role === 'REVIEWER'
                    ? 'bg-secondary text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Reviewer
              </button>
              <button
                onClick={() => handleQuickSwitch('admin')}
                className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                  user?.role === 'ADMIN'
                    ? 'bg-tertiary text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-surface-container">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs ring-2 ring-surface-container">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-on-surface leading-tight">
                  {user?.fullName}
                </span>
                <span className="font-label-caps text-[9px] uppercase tracking-wider text-primary font-bold">
                  {user?.role}
                </span>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 ml-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Lower Tier: Horizontal Navigation Tabs Bar */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 py-2 border-t border-surface-container/60">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`
                }
              >
                <Icon size={14} className="flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
};
