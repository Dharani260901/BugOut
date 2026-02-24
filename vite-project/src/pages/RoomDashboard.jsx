import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoomApi, joinRoomApi, getMyRoomsApi } from "../api/roomApi";
import {
  FiLogOut,
  FiLock,
  FiPlusCircle,
  FiUsers,
  FiArrowRight,
  FiCopy,
  FiCheckCircle,
  FiShield,
  FiActivity,
  FiHash,
} from "react-icons/fi";

export default function RoomDashboard() {
  const navigate = useNavigate();

  /* ================= USER ================= */
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ================= STATES ================= */
  const [tab, setTab] = useState("create");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [myRooms, setMyRooms] = useState([]);
  const [copied, setCopied] = useState(false);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================= CREATE ROOM ================= */
  const handleCreateRoom = async () => {
    try {
      const data = await createRoomApi({
        roomName: roomNameInput,
        password: roomPasswordInput,
      });
      setRoomCode(data.roomId);
      setRoomName(data.roomName);
      setRoomCreated(true);
      // Refresh list
      const res = await getMyRoomsApi();
      setMyRooms(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= JOIN ROOM ================= */
  const handleJoinRoom = async () => {
    try {
      const data = await joinRoomApi({
        roomCode: joinCode,
        password: joinPassword,
      });
      navigate(`/room/${data.roomId}`, {
        state: { roomName: data.roomName },
      });
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    getMyRoomsApi().then((res) => setMyRooms(res.data));
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white font-['Outfit']">
      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center px-8 py-4 bg-[#111827]/50 border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center">
            <span className="text-white text-lg">🛡️</span>
          </div>
          <span className="font-bold tracking-tighter text-xl hidden md:block">BugOut</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden sm:flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20 bg-emerald-500/5">
            <FiLock size={12} className="animate-pulse" /> E2E Encrypted
          </span>
          
          <div className="flex items-center gap-4 pl-6 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-white leading-tight">{user?.name || "User"}</p>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">{user?.email || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all"
              title="Sign Out"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* ================= WELCOME ================= */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight">
            Welcome back, <span className="text-emerald-500">{user?.name?.split(' ')[0] || "User"}</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your secure workspaces or initialize a new session.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ================= MY ROOMS (LEFT) ================= */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-[0.2em] text-xs">
                    <FiActivity className="text-emerald-500" /> Active Workspaces
                </h2>
                <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">{myRooms.length} Rooms</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myRooms.length > 0 ? (
                myRooms.map((room) => (
                  <div
                    key={room.roomCode}
                    className="group relative rounded-2xl p-5 bg-slate-900/40 border border-slate-800/50 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <FiHash size={20} />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                        room.role === "admin" 
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                        : "bg-slate-800 text-slate-500"
                      }`}>
                        {room.role}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{room.roomName}</h3>
                    <p className="text-xs text-slate-500 mb-6 font-mono tracking-tighter">ID: {room.roomCode}</p>
                    
                    <button
                      onClick={() => navigate(`/room/${room.roomCode}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      Enter Room <FiArrowRight size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center opacity-50">
                    <FiShield size={40} className="text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold">No active rooms found</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= ACTIONS CARD (RIGHT) ================= */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                {/* TABS */}
                <div className="flex p-2 bg-black/20">
                    <button
                        onClick={() => { setTab("create"); setRoomCreated(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        tab === "create" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        <FiPlusCircle /> Create
                    </button>
                    <button
                        onClick={() => { setTab("join"); setRoomCreated(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        tab === "join" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        <FiUsers /> Join
                    </button>
                </div>

                <div className="p-8">
                    {roomCreated ? (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheckCircle className="text-emerald-500" size={32} />
                            </div>
                            <h2 className="text-2xl font-black mb-1">Room Initialized</h2>
                            <p className="text-slate-500 text-sm mb-8 italic">"{roomName}"</p>
                            
                            <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 mb-6">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Key</label>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-mono text-xl text-emerald-500 tracking-[0.2em]">{roomCode}</span>
                                    <button
                                        onClick={() => copyToClipboard(roomCode)}
                                        className={`p-2 rounded-lg transition-all ${copied ? "text-emerald-500 bg-emerald-500/10" : "text-slate-500 bg-slate-800"}`}
                                    >
                                        {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/room/${roomCode}`)}
                                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20"
                            >
                                ENTER WORKSPACE
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">
                                    {tab === "create" ? "Room Identifier" : "Shared Code"}
                                </label>
                                <input
                                    type="text"
                                    value={tab === "create" ? roomNameInput : joinCode}
                                    onChange={(e) => tab === "create" ? setRoomNameInput(e.target.value) : setJoinCode(e.target.value)}
                                    placeholder={tab === "create" ? "e.g. Project X" : "Paste code here..."}
                                    className="w-full bg-black/40 border border-slate-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Security Password</label>
                                <div className="relative">
                                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="password"
                                        value={tab === "create" ? roomPasswordInput : joinPassword}
                                        onChange={(e) => tab === "create" ? setRoomPasswordInput(e.target.value) : setJoinPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={tab === "create" ? handleCreateRoom : handleJoinRoom}
                                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                            >
                                {tab === "create" ? <><FiPlusCircle /> Initialize Room</> : <><FiUsers /> Access Room</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Add these for missing icons in previous code
const FiKey = (props) => (
    <svg {...props} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 7l.343-.343a8.66 8.66 0 0 1 6.143-2.543H22v3.882a8.59 8.59 0 0 1-2.51 6.118L19 15"></path></svg>
);