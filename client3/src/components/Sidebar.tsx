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
  FileText,
  Clock,
  History,
  CheckCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAdmin, isTechnician, isReviewer } = useAuth();

  const navSections = [
    {
      title: null,
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'TESTING & CALIBRATION',
      items: [
        { to: '/tests/new', label: 'Test Wizard', icon: FlaskConical },
        { to: '/tests', label: 'Evaluations', icon: FileCheck2 },
      ],
    },
    {
      title: 'METROLOGY ASSETS',
      items: [
        { to: '/instruments', label: 'Instruments Registry', icon: Scale },
        { to: '/rules', label: 'OIML Rule Engine', icon: BookOpen },
      ],
    },
    {
      title: 'REPORTS & REPOSITORY',
      items: [
        { to: '/repository', label: 'Digital Certificates', icon: FileText },
        ...((isReviewer || isAdmin) ? [{ to: '/tests?status=UNDER_REVIEW', label: 'Review Queue', icon: Clock, badge: '5' }] : []),
      ],
    },
    {
      title: 'SYSTEM & COMPLIANCE',
      items: [
        { to: '/audit-logs', label: 'Audit Trail', icon: History },
        ...(isAdmin ? [{ to: '/users', label: 'Staff Directory', icon: Users }] : []),
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#071328] text-slate-300 flex flex-col min-h-screen border-r border-[#132746] flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#132746]">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Scale size={20} className="stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base text-white tracking-tight">METROLOGIX</span>
            <span className="text-[9px] uppercase font-bold tracking-wider bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
              NAWI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight">
            OIML R 76 Compliance Lab
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {sec.title && (
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 py-1">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-[#0f223f]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom User Card (as seen in Figma) */}
      <div className="p-3 border-t border-[#132746]">
        <div className="bg-[#0e213d] border border-[#1b3459] rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'P'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0e213d]"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {user?.fullName || 'Priya Verma'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {user?.role?.toLowerCase() || 'Technician'}
              </span>
            </div>
          </div>
          <span className="text-[9px] uppercase font-bold text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-700/40">
            {user?.role === 'TECHNICIAN' ? 'TECH' : user?.role === 'REVIEWER' ? 'REV' : 'ADMIN'}
          </span>
        </div>
      </div>
    </aside>
  );
};
