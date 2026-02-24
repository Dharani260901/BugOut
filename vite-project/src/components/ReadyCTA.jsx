import React from "react";
import { useNavigate } from "react-router-dom";
import { MdBolt } from "react-icons/md";

export default function ReadyCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 flex justify-center items-center px-6 bg-[#0B0F14] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl w-full text-center p-12 md:p-20 rounded-[3rem] border border-slate-800 bg-[#111827]/60 backdrop-blur-2xl relative z-10 shadow-2xl overflow-hidden group">
        
        {/* Animated Corner Border */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50"></div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <MdBolt size={32} />
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
          Ready to Secure Your <span className="text-emerald-500">Communications?</span>
        </h2>

        <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Deploy your first encrypted node in seconds. No tracking, no logs, no compromises. 
          The keys stay in your hands.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            onClick={() => navigate("/signup")}
          >
            Initialize Account <span className="text-lg">→</span>
          </button>
          
          <button 
            className="w-full sm:w-auto bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl transition-all"
            onClick={() => navigate("/login")}
          >
            Member Login
          </button>
        </div>

        {/* Security Trust Badge */}
        <div className="mt-12 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">End-to-End Encrypted</span>
           <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Zero Knowledge</span>
           <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">P2P Protocol</span>
        </div>
      </div>
    </section>
  );
}