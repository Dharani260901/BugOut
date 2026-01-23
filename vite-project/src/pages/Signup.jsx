import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signupApi } from "../api/authApi";

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

    // 🔐 AUTO LOGIN
//    localStorage.setItem("accessToken", data.accessToken);
// localStorage.setItem("refreshToken", data.refreshToken);
// localStorage.setItem("user", JSON.stringify(data.user));


    toast.success("Account created successfully");
    navigate("/dashboard");
  } catch (err) {
    toast.error(err.message);
  }

  }
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

        <p className="text-gray-600 mt-3 text-center w-72 leading-relaxed">
          Join thousands of teams collaborating securely
        </p>

        <div className="flex gap-6 mt-10">
          <div className="bg-white shadow-md border px-6 py-4 rounded-2xl text-center">
            <h3 className="text-xl font-semibold text-green-600">256-bit</h3>
            <p className="text-gray-500 text-sm">AES Encryption</p>
          </div>

          <div className="bg-white shadow-md border px-6 py-4 rounded-2xl text-center">
            <h3 className="text-xl font-semibold text-green-600">Zero</h3>
            <p className="text-gray-500 text-sm">Data Stored</p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
<div className="w-full md:w-1/2 flex my-12">

  <div className="w-[78%] mx-auto flex flex-col justify-center">

    <h2 className="text-[30px] font-bold">
      Create account
    </h2>

    <p className="text-gray-500 mt-1 text-[15px]">
      Start collaborating securely in minutes
    </p>

    {/* FORM */}
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSignup}>

      <div>
        <label className="text-sm text-gray-600">Full Name</label>
        <input
          type="text"
           value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400 text-[15px]"
        />
      </div>

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

      <div>
        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400 text-[15px]"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400 text-[15px]"
        />
      </div>

      <div className="border rounded-2xl px-5 py-4 text-sm text-gray-600">
        <p>• At least 8 characters</p>
        <p>• Contains a number</p>
        <p>• Contains uppercase</p>
        <p>• Passwords match</p>
      </div>

      <button className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg shadow-md">
        Create Account →
      </button>
    </form>

    <div className="mt-6 text-center">
      <span className="text-green-600 text-sm bg-green-50 px-5 py-1 rounded-full">
        🔐 E2E Encrypted
      </span>

      <p className="mt-4 text-sm text-gray-600">
        Already have an account?
        <span className="text-green-600 font-medium cursor-pointer ml-1" onClick={() => navigate("/login")}>
          Sign in
        </span>
      </p>
    </div>
  </div>
</div>

    </div>
  );
}

