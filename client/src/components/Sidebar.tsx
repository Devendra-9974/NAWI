import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Scale,
  FlaskConical,
  FileCheck2,
  BookOpen,
  Users,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAdmin, isTechnician } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/instruments', label: 'Instruments', icon: Scale },
    { to: '/tests', label: 'Test Evaluations', icon: FlaskConical },
    { to: '/repository', label: 'Digital Repository', icon: FileCheck2 },
    { to: '/rules', label: 'OIML R 76 Rules', icon: BookOpen },
  ];

  const adminItems = [
    { to: '/users', label: 'User Directory', icon: Users },
    { to: '/audit-logs', label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Quick Launch Buttons */}
      {isTechnician && (
        <div className="p-4 border-b border-slate-100">
          <NavLink
            to="/tests/new"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition text-sm"
          >
            <PlusCircle size={16} />
            <span>New Evaluation</span>
          </NavLink>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
          Laboratory Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {isAdmin && (
          <>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1">
              Administration
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom Regulatory Reference Badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">OIML Recommendation</p>
        <p>R 76-1:2006 (E)</p>
        <p className="text-[11px] text-slate-400 mt-1">Metrological Verification Engine v1.0</p>
      </div>
    </aside>
  );
};
