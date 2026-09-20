import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-mono font-bold text-white tracking-wider mb-2">
        404 - SEGMENT NOT FOUND
      </h1>
      <p className="text-xs font-mono text-slate-400 max-w-md mb-6">
        The requested network segment or defensive telemetric resource does not exist or has been quarantined.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(0,229,153,0.3)]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Executive Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;


