import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoomApi, joinRoomApi, getMyRoomsApi } from "../api/roomApi";

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

      navigate(`/room/${data.roomId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
  getMyRoomsApi().then(res => setMyRooms(res.data));
}, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center px-10 py-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-green-400 rounded-lg" />
          <span className="font-semibold text-xl">CryptRoom</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-green-600 border rounded-full px-4 py-1 text-sm bg-green-50">
            🔐 E2E Encrypted
          </span>

          <div className="text-right">
            <p className="font-semibold text-sm">{user?.name || "User"}</p>
            <p className="text-gray-500 text-sm">{user?.email || ""}</p>
          </div>

          <button onClick={handleLogout} className="text-xl">
            ↪️
          </button>
        </div>
      </header>

      {/* ================= WELCOME ================= */}
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">
          Welcome,{" "}
          <span className="text-green-600">
            {user?.name || "User"}
          </span>
        </h1>
        <p className="text-gray-500 mt-2">
          Create or join a secure room to start collaborating
        </p>
         {/* ================= MY ROOMS (SCROLL FIX APPLIED) ================= */}
        <div className="max-w-4xl mx-auto mt-8 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-2">
            {myRooms.map((room) => (
              <div
                key={room.roomCode}
                className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{room.roomName}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      room.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {room.role.toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/room/${room.roomCode}`)}
                  className="text-green-600 font-medium"
                >
                  Open →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex justify-center mt-6">
        <div className="bg-gray-100 rounded-full flex">
          <button
            onClick={() => {
              setTab("create");
              setRoomCreated(false);
            }}
            className={`px-6 py-2 rounded-full ${
              tab === "create"
                ? "bg-white shadow font-semibold"
                : "text-gray-600"
            }`}
          >
            ➕ Create Room
          </button>

          <button
            onClick={() => {
              setTab("join");
              setRoomCreated(false);
            }}
            className={`px-6 py-2 rounded-full ${
              tab === "join"
                ? "bg-white shadow font-semibold"
                : "text-gray-600"
            }`}
          >
            👤 Join Room
          </button>
        </div>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="flex justify-center mt-8">
        <div className="bg-white border rounded-2xl shadow-md px-10 py-8 w-[420px]">

          {/* ===== ROOM CREATED SUCCESS ===== */}
          {roomCreated ? (
            <>
              <h2 className="text-xl font-semibold">✨ Room Created!</h2>

              <p className="text-gray-500 mt-1 italic">“{roomName}”</p>

              <div className="mt-6">
                <label className="text-sm text-gray-600">Room Code</label>
                <div className="flex items-center justify-between border rounded-xl px-4 py-3 mt-1">
                  <span className="text-green-600 font-semibold tracking-widest">
                    {roomCode}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(roomCode)}
                  >
                    📋
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate(`/room/${roomCode}`)}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-xl"
              >
                Enter Room →
              </button>
            </>
          ) : tab === "create" ? (
            <>
              {/* ===== CREATE ROOM ===== */}
              <h2 className="text-xl font-semibold">✨ Create New Room</h2>

              <div className="mt-6">
                <label className="text-sm text-gray-600">Room Name</label>
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-2"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-600">Room Password</label>
                <input
                  type="password"
                  value={roomPasswordInput}
                  onChange={(e) => setRoomPasswordInput(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-2"
                />
              </div>

              <button
                onClick={handleCreateRoom}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-xl"
              >
                Create Room
              </button>
            </>
          ) : (
            <>
              {/* ===== JOIN ROOM ===== */}
              <h2 className="text-xl font-semibold">👥 Join Room</h2>

              <div className="mt-6">
                <label className="text-sm text-gray-600">Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-2"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-600">Room Password</label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-2"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-xl"
              >
                Join Room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
