import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-10 px-10 flex justify-between items-center text-sm text-gray-600">
      
      {/* Left Logo */}
      <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-green-400 rounded-lg" />
          <span className="font-semibold text-lg">BugOut</span>
        </div>

      {/* Right Copyright */}
      <p>
        © 2025 CryptRoom. Built for secure collaboration.
      </p>

    </footer>
  );
}
