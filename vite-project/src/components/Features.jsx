import React from "react";
import { MdSecurity, MdChat, MdVideocam, MdCloudUpload, MdGroups, MdVpnKey } from "react-icons/md";

export default function Features() {
  const cards = [
    {
      title: "End-to-End Encryption",
      desc: "All communication is shielded with military-grade AES-256 encryption protocols.",
      icon: <MdSecurity className="text-emerald-400" />,
      tag: "Military Grade"
    },
    {
      title: "Secure Messaging",
      desc: "Real-time encrypted chat with volatile memory storage and zero data retention.",
      icon: <MdChat className="text-emerald-400" />,
      tag: "Real-time"
    },
    {
      title: "Private Video Calls",
      desc: "True Peer-to-Peer (P2P) technology ensures your stream never hits a central server.",
      icon: <MdVideocam className="text-emerald-400" />,
      tag: "P2P Link"
    },
    {
      title: "Secure File Vault",
      desc: "Automated encryption/decryption during transit for all shared documents.",
      icon: <MdCloudUpload className="text-emerald-400" />,
      tag: "E2E Sync"
    },
    {
      title: "Node Collaboration",
      desc: "Isolated session environments with individual access keys and passwords.",
      icon: <MdGroups className="text-emerald-400" />,
      tag: "Isolated"
    },
    {
      title: "Zero Knowledge",
      desc: "Proprietary security architecture ensures only you hold the decryption keys.",
      icon: <MdVpnKey className="text-emerald-400" />,
      tag: "Privacy First"
    }
  ];

  return (
    <section className="py-24 bg-[#0B0F14] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Forged in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Silence</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">
            Every feature engineered for maximum operational security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div 
              key={i} 
              className="group relative p-8 rounded-[2rem] bg-[#111827]/40 border border-slate-800/50 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Card Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-900 rounded-2xl text-3xl shadow-inner border border-slate-800 group-hover:scale-110 transition-transform duration-500">
                  {c.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                  {c.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {c.title}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {c.desc}
              </p>

              {/* Decorative line */}
              <div className="mt-6 w-12 h-1 bg-slate-800 group-hover:w-full group-hover:bg-emerald-500/30 transition-all duration-700"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}