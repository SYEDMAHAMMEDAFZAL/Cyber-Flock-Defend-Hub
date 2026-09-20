import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Activity,
  Crosshair,
  Bug,
  Radar,
  DollarSign,
  FileCheck,
  Blocks,
  Globe2,
  Sliders,
  Settings,
  ShieldCheck,
  BookOpen,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';

  const navGroups = [
    {
      title: 'CORE DEFENSE',
      items: [
        { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Risk Quantification', path: '/risk', icon: Activity },
        ...(isSuperAdmin ? [{ label: 'Attack Simulator', path: '/attack-wizard', icon: Crosshair, badge: 'MAIN ADMIN' }] : []),
      ],
    },
    {
      title: 'SURFACE & TELEMETRY',
      items: [
        { label: 'Vulnerabilities & CVEs', path: '/vulnerabilities', icon: Bug },
        { label: 'SIEM / EDR / PAM Feeds', path: '/telemetry', icon: Radar },
        { label: 'Investment Optimizer', path: '/investments', icon: DollarSign },
      ],
    },
    {
      title: 'AUDIT & VERIFICATION',
      items: [
        { label: 'Executive Audit Reports', path: '/reports', icon: FileCheck },
        { label: 'Blockchain Anchors', path: '/blockchain', icon: Blocks },
        { label: 'Market Benchmarks', path: '/benchmarks', icon: Globe2 },
      ],
    },
    {
      title: 'TENANT & ADMIN',
      items: [
        ...(isSuperAdmin ? [{ label: 'Admin Portal', path: '/admin', icon: Settings, badge: 'ADMIN' }] : []),
        { label: 'Enterprise Onboarding', path: '/onboarding', icon: Sliders },
        { label: 'Legal & Ethics Policy', path: '/legal', icon: BookOpen },
        { label: 'Request Live Demo', path: '/demo', icon: Send },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050a0c] border-r border-[#152327] flex flex-col h-screen select-none shrink-0 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#152327] bg-[#030608]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(0,229,153,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
              CYBER FLOCK
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block tracking-wider font-semibold">
              DEFENSE PLATFORM
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-mono tracking-wider text-slate-500 font-semibold mb-1 uppercase">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#18262a] bg-[#090d16]">
        <div className="p-2.5 rounded-lg bg-[#0e1a1d] border border-[#18262a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300">Defense Pipeline</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


