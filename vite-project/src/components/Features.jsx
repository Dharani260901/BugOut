import React from "react";

export default function Features() {
  const cards = [
    {
      title: "End-to-End Encryption",
      desc: "All messages, files and video calls are encrypted with AES-256 encryption.",
      icon: "🔒"
    },
    {
      title: "Secure Messaging",
      desc: "Real-time encrypted chat with zero data retention.",
      icon: "💬"
    },
    {
      title: "Private Video Calls",
      desc: "Peer-to-peer video calls with no intermediary servers.",
      icon: "🎥"
    },
    {
      title: "Encrypted File Sharing",
      desc: "Share files securely with auto encryption & decryption.",
      icon: "📁"
    },
    {
      title: "Team Collaboration",
      desc: "Create rooms with unique codes & passwords.",
      icon: "👥"
    },
    {
      title: "Zero Knowledge",
      desc: "We never see your data. Only you hold the keys.",
      icon: "🔑"
    }
  ];

  return (
    <section className="py-24 bg-white text-center">
      <h2 className="text-3xl font-bold">
        Built for <span className="bg-gradient-to-tr from-purple-500 to-green-400 bg-clip-text text-transparent">Privacy</span>
      </h2>
      <p className="text-gray-600 mt-2">
        Every feature designed with security as foundation
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-16 mt-10">
        {cards.map((c, i) => (
          <div key={i} className="border p-6 rounded-xl shadow-sm">
            <div className="text-3xl">{c.icon}</div>
            <h3 className="font-semibold mt-4">{c.title}</h3>
            <p className="text-gray-600 text-sm mt-2">
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
