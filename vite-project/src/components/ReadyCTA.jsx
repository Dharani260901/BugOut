import React from "react";
import { useNavigate } from "react-router-dom";

export default function ReadyCTA() {

    const navigate = useNavigate();
  return (
    <section className="flex justify-center items-center  px-6 bg-transparent">
      <div className="max-w-5xl w-full text-center p-14 rounded-3xl shadow-xl border 
      bg-gradient-to-br from-green-50/60 via-white to-purple-50">

        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Collaborate Securely?
        </h2>

        <p className="text-gray-600 mt-3">
          Create your first encrypted room in seconds. No credit card required.
        </p>

        <button className="mt-8 bg-green-500 hover:bg-green-600 text-white px-8 py-3 
        rounded-lg text-lg shadow-md transition" onClick={() => navigate("/signup")}>
          Get Started Free →
        </button>
      </div>
    </section>
  );
}
