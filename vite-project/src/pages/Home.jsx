import React from "react";
import Features from "../components/Features";
import ReadyCTA from "../components/ReadyCTA";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {

    const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-green-400 rounded-lg" />
          <span className="font-semibold text-lg">CryptRoom</span>
        </div>

        <div className="flex gap-4">
          <button className="text-gray-600" onClick={() => navigate("/login")}>Sign In</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-md" 
          onClick={() => navigate("/signup")}>
            Get Started →
          </button>
        </div>
      </header>

      <section className="flex flex-col justify-center items-center text-center mt-20 px-6">
        <span className="px-4 py-1 border rounded-full text-sm flex items-center gap-2">
          🔒 E2E Encrypted
        </span>

        <h1 className="text-5xl font-bold mt-6">
          Secure Collaboration
          <span className="block bg-gradient-to-tr from-purple-500 to-green-400 bg-clip-text text-transparent">
            Without Compromise
          </span>
        </h1>

        <p className="mt-4 text-gray-600 max-w-2xl">
          Create encrypted rooms for your team. Chat, video call, and share
          files with end-to-end encryption. Your data stays yours.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="bg-green-500 text-white px-6 py-3 rounded-md" onClick={() => navigate("/signup")}>
            Create Free Room
          </button>

          <button className="border px-6 py-3 rounded-md" onClick={() => navigate("/signup")}>
            Join Existing Room
          </button>
        </div>

        <div className="flex gap-8 mt-8 text-sm text-gray-600">
          <span>🔐 256-bit AES</span>
          <span>🧠 Zero Knowledge</span>
          <span>⚡ Real-time Sync</span>
        </div>
      </section>

      <Features />
      <ReadyCTA />
      <Footer />
    </div>
  );
}
