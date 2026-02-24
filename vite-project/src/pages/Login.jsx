import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginApi } from "../api/authApi";
import { FiLogIn, FiLock } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginApi({ email, password });
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0B0F14" }}>
      {/* LEFT SECTION */}
      <div
        className="hidden md:flex w-1/2 flex-col justify-center items-center"
        style={{ background: "linear-gradient(135deg, #111827 0%, #0B0F14 100%)", borderRight: "1px solid #1F2937" }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-green-400 shadow-lg flex items-center justify-center">
          <span className="text-white text-3xl">🛡️</span>
        </div>
        <h1 className="text-4xl font-bold mt-6 tracking-tight bg-gradient-to-tr from-purple-500 to-green-400 bg-clip-text text-transparent">
          BugOut
        </h1>
        <p className="mt-4 text-center w-[430px] leading-relaxed" style={{ color: "#9CA3AF" }}>
          Secure, encrypted collaboration rooms for teams who value privacy
        </p>
        <div className="mt-10 space-y-4">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{ background: "#111827", border: "1px solid #1F2937" }}
          >
            <span className="text-xl" style={{ color: "#10B981" }}>🔒</span>
            <p className="text-sm" style={{ color: "#F9FAFB" }}>End-to-end encryption</p>
          </div>
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{ background: "#111827", border: "1px solid #1F2937" }}
          >
            <span className="text-xl" style={{ color: "#10B981" }}>🛡️</span>
            <p className="text-sm" style={{ color: "#F9FAFB" }}>Zero-knowledge architecture</p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex" style={{ background: "#0B0F14" }}>
        <div className="w-[78%] mx-auto flex flex-col justify-center">
          <h2 className="text-[30px] font-bold" style={{ color: "#F9FAFB" }}>
            Welcome back
          </h2>
          <p className="mt-1 text-[15px]" style={{ color: "#9CA3AF" }}>
            Sign in to access your secure rooms
          </p>

          {/* FORM */}
          <form className="mt-8 flex flex-col gap-5" onSubmit={handleLogin}>
            {/* EMAIL */}
            <div>
              <label className="text-sm" style={{ color: "#9CA3AF" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl px-4 py-2 text-[15px] outline-none transition"
                style={{
                  background: "#111827",
                  border: "1px solid #1F2937",
                  color: "#F9FAFB",
                }}
                onFocus={e => (e.target.style.borderColor = "#10B981")}
                onBlur={e => (e.target.style.borderColor = "#1F2937")}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm" style={{ color: "#9CA3AF" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full rounded-xl px-4 py-2 text-[15px] outline-none transition"
                style={{
                  background: "#111827",
                  border: "1px solid #1F2937",
                  color: "#F9FAFB",
                }}
                onFocus={e => (e.target.style.borderColor = "#10B981")}
                onBlur={e => (e.target.style.borderColor = "#1F2937")}
              />
            </div>

            {/* SIGN IN BUTTON */}
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-md transition"
              style={{ background: "#10B981", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#059669")}
              onMouseLeave={e => (e.currentTarget.style.background = "#10B981")}
            >
              Sign In
              <FiLogIn size={18} />
            </button>
          </form>

          {/* BOTTOM */}
          <div className="mt-6 text-center">
            <span
              className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full"
              style={{ color: "#10B981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <FiLock size={14} />
              E2E Encrypted
            </span>
            <p className="mt-4 text-sm" style={{ color: "#9CA3AF" }}>
              Don't have an account?{" "}
              <span
                className="font-medium cursor-pointer ml-1"
                style={{ color: "#10B981" }}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}