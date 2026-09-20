import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Watermark from './Watermark';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock } from 'lucide-react';

export const Layout = () => {
  const { deterrenceActive } = useAuth();
  const [isConcealed, setIsConcealed] = useState(false);

  useEffect(() => {
    // Keep screen always visible and responsive without disruptive concealment
    setIsConcealed(false);
  }, [deterrenceActive]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#091215] text-slate-100 flex overflow-hidden">
      {/* Forensic Diagonal Watermark */}
      <Watermark />

      {/* Screenshot Concealment Overlay */}
      {isConcealed && deterrenceActive && (
        <div
          onClick={() => setIsConcealed(false)}
          className="fixed inset-0 z-50 bg-[#091215]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 cursor-pointer select-none"
        >
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-mono font-bold text-white tracking-wider mb-2">
            TELEMETRY CONCEALED
          </h2>
          <p className="text-xs text-slate-400 font-mono max-w-md text-center mb-6">
            Cyber Flock Screenshot Deterrence Policy Active. Screen concealed due to loss of window focus.
          </p>
          <button
            onClick={() => setIsConcealed(false)}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(0,229,153,0.3)]"
          >
            CLICK TO RESUME SESSION
          </button>
        </div>
      )}

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Responsive Left Sidebar (Off-canvas on mobile/tablet, persistent on desktop) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isConcealed && deterrenceActive ? 'filter blur-md' : ''}`}>
        <Topbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-[#091215] cyber-grid flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          
          {/* Global Professional Footer */}
          <footer className="mt-12 pt-6 border-t border-[#18262a] flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-emerald-400" />
              <span>&copy; 2026 CYBER FLOCK DEFENSE HUB. All Rights Reserved.</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="/legal" className="hover:text-emerald-400 transition-colors">Terms of Service & Data Policy</a>
              <a href="/legal" className="hover:text-emerald-400 transition-colors">Global Privacy Laws (GDPR & DPDP Act)</a>
            </div>
            
            <div className="flex items-center gap-2 border border-[#18262a] px-2.5 py-1 rounded bg-[#060b0e]">
              <span className="text-slate-600">EXECUTIVE DIRECTOR & CEO:</span>
              <span className="text-emerald-400 font-bold tracking-wider">S.MD.AFZAL</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;


