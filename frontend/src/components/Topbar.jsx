import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  CreditCard,
  QrCode,
  Sparkles,
  Menu,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentModal from './PaymentModal';

export const Topbar = ({ onToggleMobileMenu }) => {
  const {
    user,
    activeOrg,
    organizations,
    switchOrg,
    currency,
    toggleCurrency,
    logout,
  } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [executingAction, setExecutingAction] = useState(null);

  const handleExecuteCommand = (message) => {
    setExecutingAction(message);
    setTimeout(() => {
      setExecutingAction(null);
      setSearchOpen(false);
    }, 1500); // Simulate network execution time
  };

  // Ctrl+K Global Search Keyboard Shortcut
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  return (
    <>
      <header className="h-16 bg-[#060b0e] border-b border-[#18262a] flex items-center justify-between px-3 sm:px-6 z-30 shrink-0">
        {/* Left side: Mobile Menu Hamburger, Org Switcher & Simulation Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Hamburger button for mobile/tablet */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-[#0e1a1d] border border-[#18262a] text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Organization Switcher (Super Admin only) or Tenant Badge */}
          {isSuperAdmin ? (
            <div className="relative">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0e1a1d] border border-[#18262a] hover:border-emerald-500/50 text-xs font-medium text-slate-200 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[110px] sm:max-w-[180px]">
                  {activeOrg ? activeOrg.name : 'Select Organization'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {orgDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#0f172a] border border-[#18262a] rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 font-semibold border-b border-slate-800 flex items-center justify-between">
                    <span>SUPER ADMIN: SWITCH TENANT</span>
                    <span className="text-[9px] text-emerald-400">({organizations.length} ORGS)</span>
                  </div>
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrg(org.id);
                        setOrgDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        activeOrg?.id === org.id ? 'text-emerald-400 bg-emerald-500/10 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{org.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {org.plan_tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0e1a1d] border border-[#18262a] text-xs font-medium text-slate-200 shadow-sm"
              title={`Corporate session strictly scoped to: ${activeOrg?.name || 'Assigned Enterprise'}`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">YOUR COMPANY</span>
                <span className="truncate max-w-[120px] sm:max-w-[200px] font-bold text-emerald-300">
                  {activeOrg ? activeOrg.name : 'Assigned Enterprise'}
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold shrink-0">
                <Lock className="w-2.5 h-2.5" />
                SCOPED
              </span>
            </div>
          )}

          {/* Synthetic Data Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ENTERPRISE DEFENSE ACTIVE</span>
          </div>
        </div>

        {/* Right side: Payment Upgrade, Currency, and User Profile */}
        <div className="flex items-center gap-3">
          {/* Global Search / Command Palette */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-[#0a1418] border border-white/5 hover:border-emerald-500/30 text-xs font-sans text-slate-500 transition-colors w-72 shadow-inner group"
          >
            <div className="flex items-center gap-2 truncate">
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span className="truncate">Search resources, IPs, CVEs...</span>
            </div>
            <div className="ml-auto flex items-center gap-1 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">Ctrl</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">K</span>
            </div>
          </button>

          {/* Currency Switcher */}
          <button
            onClick={toggleCurrency}
            title={`Switch Currency (Currently ${currency})`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1a1d] border border-[#18262a] hover:border-emerald-500/40 text-xs font-mono font-semibold text-slate-200 transition-colors shrink-0"
          >
            <span className="text-emerald-400">{currency === 'USD' ? '$' : '₹'}</span>
            <span>{currency}</span>
          </button>

          {/* Subscription & Billing */}
          <button
            onClick={() => setPaymentModalOpen(true)}
            title="Manage Enterprise Subscription"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-mono font-bold text-emerald-400 transition-colors shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>SUBSCRIPTION</span>
          </button>

          {/* User Badge & Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800 shrink-0">
            <div className="text-right hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                {user?.full_name || user?.email || 'SecOps Lead'}
              </div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-medium">
                {user?.role || 'Analyst'}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !executingAction && setSearchOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#0a1418] border border-[#18262a] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#18262a]">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                autoFocus
                disabled={executingAction !== null}
                placeholder={executingAction ? "Executing command..." : "Search IPs, CVEs, endpoints, or run commands..."} 
                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 placeholder-slate-500 font-sans disabled:opacity-50"
              />
              <button onClick={() => !executingAction && setSearchOpen(false)} className="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white transition-colors">ESC</button>
            </div>
            
            {/* Search Results (Mock) */}
            <div className="p-2 overflow-y-auto max-h-[60vh] relative">
              {executingAction && (
                <div className="absolute inset-0 bg-[#0a1418]/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <div className="text-emerald-400 font-mono text-xs font-bold animate-pulse">{executingAction}</div>
                </div>
              )}
              
              <div className="px-3 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Suggested Actions</div>
              
              <div 
                onClick={() => handleExecuteCommand("Initiating full EPSS network scan...")}
                className="p-2 flex items-center gap-3 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="p-1.5 bg-slate-800 rounded group-hover:bg-emerald-500/20"><ShieldCheck className="w-4 h-4 text-emerald-400" /></div>
                <div>
                  <div className="text-sm font-sans text-white font-medium">Run full vulnerability scan</div>
                  <div className="text-xs font-mono text-slate-500">Executes comprehensive EPSS assessment across all endpoints</div>
                </div>
              </div>
              
              <div 
                onClick={() => handleExecuteCommand("Isolating WIN-SRV-049 at firewall layer...")}
                className="p-2 flex items-center gap-3 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="p-1.5 bg-slate-800 rounded group-hover:bg-amber-500/20"><AlertTriangle className="w-4 h-4 text-amber-400" /></div>
                <div>
                  <div className="text-sm font-sans text-white font-medium">Isolate endpoint: WIN-SRV-049</div>
                  <div className="text-xs font-mono text-slate-500">Quarantine affected server from active SIEM alerts</div>
                </div>
              </div>
              
              <div className="px-3 pt-4 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Recent CVEs</div>
              
              <div 
                onClick={() => handleExecuteCommand("Fetching CVE-2024-3094 telemetry...")}
                className="p-2 flex items-center gap-3 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="p-1.5 bg-slate-800 rounded text-[10px] font-mono text-rose-400 font-bold border border-rose-500/20">9.8</div>
                <div>
                  <div className="text-sm font-sans text-emerald-300 font-bold">CVE-2024-3094</div>
                  <div className="text-xs font-sans text-slate-400">XZ Utils malicious code injection vulnerability</div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-[#060b0e] px-4 py-2 flex items-center justify-between border-t border-[#18262a]">
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1"><span className="px-1 rounded bg-slate-800">↵</span> to select</span>
                <span className="flex items-center gap-1"><span className="px-1 rounded bg-slate-800">↑</span><span className="px-1 rounded bg-slate-800">↓</span> to navigate</span>
              </div>
              <div className="text-[9px] font-mono text-emerald-500/50">CYBER FLOCK AI SEARCH</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedPlan={activeOrg?.plan_tier || 'professional'}
      />
    </>
  );
};

export default Topbar;


