import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signupApi } from "../api/authApi";
import { FiUserPlus, FiLock, FiShield, FiUser, FiMail, FiKey, FiCheckCircle } from "react-icons/fi";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const data = await signupApi({ name, email, password });

      // 🔐 AUTO LOGIN (Existing Logic Preserved)
      // localStorage.setItem("accessToken", data.accessToken);
      // localStorage.setItem("refreshToken", data.refreshToken);
      // localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F14] font-['Outfit']">
      {/* LEFT SECTION - Premium Branding */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center relative overflow-hidden border-r border-slate-800/50 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F14] to-[#0B0F14]">
        {/* Abstract Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-500">
            <span className="text-white text-3xl">🛡️</span>
          </div>
          
          <h1 className="text-5xl font-black tracking-tighter text-white">
            BugOut <span className="text-emerald-500 font-medium italic">Pro</span>
          </h1>
          
          <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
            Join thousands of teams collaborating in the most secure workspace built for privacy.
          </p>

          <div className="flex gap-4 mt-12 justify-center">
            <div className="px-6 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-center group hover:border-emerald-500/30 transition-all">
              <h3 className="text-2xl font-black text-emerald-500">256-bit</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">AES Encryption</p>
            </div>
            <div className="px-6 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-center group hover:border-emerald-500/30 transition-all">
              <h3 className="text-2xl font-black text-emerald-500">Zero</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Data Storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md py-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
              Create account
            </h2>
            <p className="text-slate-400">
              Start collaborating securely in minutes.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {/* FULL NAME */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-emerald-500 transition-colors">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-700 outline-none ring-0 focus:border-emerald-500/50 focus:bg-slate-900 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-emerald-500 transition-colors">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-700 outline-none ring-0 focus:border-emerald-500/50 focus:bg-slate-900 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* PASSWORD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-emerald-500 transition-colors">Password</label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-emerald-500 transition-colors">Confirm</label>
                <div className="relative">
                  <FiCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* PASSWORD RULES - Premium Box */}
            <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800/50 text-[11px] text-slate-500 grid grid-cols-2 gap-x-2 gap-y-1">
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> 8+ Characters</p>
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> One Number</p>
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> One Uppercase</p>
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> Match Verified</p>
            </div>

            <button className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
              Create Account
              <FiUserPlus size={20} />
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest px-4 py-2 rounded-full text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 mb-6 uppercase">
              <FiLock size={12} className="animate-pulse" />
              Secure Protocol Active
            </div>
            
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <button
                className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors ml-1"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}