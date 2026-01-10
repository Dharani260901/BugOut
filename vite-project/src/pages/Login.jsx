import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };


  return (
    <div className="min-h-screen flex">

      {/* LEFT SECTION */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center 
      bg-gradient-to-br from-purple-200 via-white to-green-100 border-r">

        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr 
        from-purple-500 to-green-400 shadow-lg flex items-center justify-center">
          <span className="text-white text-3xl">🛡️</span>
        </div>

        <h1 className="text-4xl font-bold mt-6 tracking-tight bg-gradient-to-tr from-purple-500 to-green-400 bg-clip-text text-transparent">
          CryptRoom
        </h1>

        <p className="text-gray-600 mt-4 text-center w-[430px] leading-relaxed">
          Secure, encrypted collaboration rooms for teams who value privacy
        </p>

        <div className="mt-10 space-y-4">

          <div className="flex items-center gap-3 bg-white shadow border px-5 py-3 rounded-xl">
            <span className="text-green-600 text-xl">🔒</span>
            <p className="text-gray-700 text-sm">End-to-end encryption</p>
          </div>

          <div className="flex items-center gap-3 bg-white shadow border px-5 py-3 rounded-xl">
            <span className="text-green-600 text-xl">🛡️</span>
            <p className="text-gray-700 text-sm">Zero-knowledge architecture</p>
          </div>

        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex">

        <div className="w-[78%] mx-auto flex flex-col justify-center">

          <h2 className="text-[30px] font-bold">
            Welcome back
          </h2>

          <p className="text-gray-500 mt-1 text-[15px]">
            Sign in to access your secure rooms
          </p>

          {/* FORM */}
          <form className="mt-8 flex flex-col gap-5" onSubmit={handleLogin}>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400 text-[15px]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400 text-[15px]"
              />
            </div>

            {/* SIGN IN BUTTON */}
            <button className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg shadow-md">
              Sign In →
            </button>
          </form>

          {/* Bottom Section */}
          <div className="mt-6 text-center">
            <span className="text-green-600 text-sm bg-green-50 px-5 py-1 rounded-full">
              🔐 E2E Encrypted
            </span>

            <p className="mt-4 text-sm text-gray-600">
              Don’t have an account?
              <span className="text-green-600 font-medium cursor-pointer ml-1" onClick={() => navigate("/signup")}>
                Sign up
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
