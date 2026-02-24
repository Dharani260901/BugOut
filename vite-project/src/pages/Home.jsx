import React from "react";
import Features from "../components/Features";
import ReadyCTA from "../components/ReadyCTA";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { FiShield, FiLock, FiCpu, FiZap, FiArrowRight } from "react-icons/fi";

export default function Home() {
    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white font-['Outfit'] overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px] -z-10"></div>

      {/* Premium Header */}
      <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-xl">🛡️</span>
          </div>
          <span className="font-bold text-2xl tracking-tighter text-white">CryptRoom</span>
        </div>

        <div className="flex gap-8 items-center">
          <button 
            className="text-slate-400 font-medium hover:text-emerald-400 transition-colors uppercase text-xs tracking-widest font-bold" 
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
          <button 
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 text-sm" 
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center text-center mt-20 px-6 relative z-10">
        <span className="px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-3 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Military Grade E2E Encryption
        </span>

        <h1 className="text-6xl md:text-8xl font-black text-white leading-[1] tracking-tighter">
          Secure Collaboration
          <span className="block bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
            Without Compromise.
          </span>
        </h1>

        <p className="mt-10 text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
          The ultimate workspace for privacy-first teams. Create encrypted rooms, 
          HD video calls, and real-time chat powered by <span className="text-emerald-500 font-medium">Zero-Knowledge</span> architecture.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mt-14">
          <button 
            className="group bg-white text-black px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-2xl shadow-white/5" 
            onClick={() => navigate("/signup")}
          >
            Create Free Room <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            className="bg-slate-900/50 border border-slate-800 backdrop-blur-md px-10 py-4 rounded-2xl font-black text-white hover:bg-slate-800 hover:border-slate-700 transition-all" 
            onClick={() => navigate("/signup")}
          >
            Join Existing Room
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-8 mt-20 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
          <span className="flex items-center gap-2 border-r border-slate-800 pr-8 last:border-0"><FiLock className="text-emerald-500" /> 256-bit AES</span>
          <span className="flex items-center gap-2 border-r border-slate-800 pr-8 last:border-0"><FiShield className="text-emerald-500" /> Zero Knowledge</span>
          <span className="flex items-center gap-2 last:border-0"><FiZap className="text-emerald-500" /> Real-time Sync</span>
        </div>
      </section>

      {/* Modern Dashboard Preview Decoration
      <div className="mt-24 max-w-6xl mx-auto px-6 relative">
          <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          <div className="relative border border-white/10 bg-slate-900/40 rounded-[2.5rem] p-4 backdrop-blur-3xl shadow-2xl">
              <div className="rounded-[1.8rem] bg-[#0B0F14] overflow-hidden border border-white/5 aspect-video flex items-center justify-center">
                  <p className="text-slate-600 font-bold tracking-widest uppercase text-xs">Secure Interface Preview</p>
              </div>
          </div>
      </div> */}

      <div className="mt-32">
        <Features />
        <ReadyCTA />
        <Footer />
      </div>
    </div>
  );
}