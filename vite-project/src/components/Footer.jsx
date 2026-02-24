import React from "react";
import { MdShield, MdLockOutline } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-[#0B0F14] border-t border-slate-800/50 px-8 lg:px-20 relative overflow-hidden">
      {/* Decorative gradient flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left: Branding */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <MdShield size={22} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase">
              Bug<span className="text-emerald-500 text-[0.9em]">Out</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] max-w-xs text-center md:text-left leading-relaxed">
            The next generation of zero-knowledge collaboration.
          </p>
        </div>

        {/* Center: System Status (Visual Only) */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full">
            <MdLockOutline className="text-emerald-500" size={14} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E2E Active</span>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            © 2025 BugOut Security Labs
          </p>
          <p className="text-slate-600 text-[10px] font-medium max-w-[200px]">
            Proprietary P2P encryption protocol. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}