import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function RoomDashboard() {
  const [roomNameInput, setRoomNameInput] = useState("");
const [roomPasswordInput, setRoomPasswordInput] = useState("");
const [joinCode, setJoinCode] = useState("");
const [joinPassword, setJoinPassword] = useState("");

const [roomCode, setRoomCode] = useState("");
const [roomName, setRoomName] = useState("");
const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};


const handleCreateRoom = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/rooms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      roomName: roomNameInput,
      password: roomPasswordInput
    })
  });

  const data = await res.json();

  if (res.ok) {
    setRoomCode(data.roomId);
    setRoomName(data.roomName);
    setRoomCreated(true);
  } else {
    alert(data.message);
  }
};
const handleJoinRoom = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/rooms/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      roomCode: joinCode,
      password: joinPassword
    })
  });

  const data = await res.json();

  if (res.ok) {
    navigate(`/room/${data.roomId}`);
  } else {
    alert(data.message);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-green-400 rounded-lg" />
          <span className="font-semibold text-xl">CryptRoom</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-green-600 border rounded-full px-4 py-1 text-sm bg-green-50">
            🔐 E2E Encrypted
          </span>

          <div className="text-right">
            <p className="font-semibold text-sm">vikashini</p>
            <p className="text-gray-500 text-sm">vikashini@gmail.com</p>
          </div>

          <button className="text-xl">↪️</button>
        </div>
      </header>

      {/* WELCOME TEXT */}
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">
          Welcome, <span className="text-green-600">vikashini</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Create or join a secure room to start collaborating with your team
        </p>
      </div>

      {/* TABS */}
      <div className="flex justify-center mt-6">
        <div className="bg-gray-100 rounded-full flex">

           <button
            onClick={() => {
              setTab("create");
              setRoomCreated(false);
            }}
            className={`px-6 py-2 rounded-full ${
              tab === "create" ? "bg-white shadow font-semibold" : "text-gray-600"
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
              tab === "join" ? "bg-white shadow font-semibold" : "text-gray-600"
            }`}
          >
            👤 Join Room
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="flex justify-center mt-8">
        <div className="bg-white border rounded-2xl shadow-md px-10 py-8 w-[420px]">

          {/* SUCCESS UI */}
          {roomCreated ? (
            <>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                ✨ Create New Room
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Set up a secure room and invite your team
              </p>

              <div className="flex justify-center mt-6">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✔️</span>
                </div>
              </div>

              <h3 className="text-center text-lg font-semibold mt-4">
                Room Created!
              </h3>

              <p className="text-center text-gray-500 text-sm italic">
                “{roomName}”
              </p>

              <div className="mt-6">
                <label className="text-sm text-gray-600">Room Code</label>
                <div className="flex items-center justify-between border rounded-xl px-4 py-3 mt-1">
                  <span className="text-green-600 font-semibold tracking-widest">
                    {roomCode}
                  </span>
                  <button className="text-gray-500">📋</button>
                </div>
              </div>

              <button className="mt-6 bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-xl">
                Enter Room →
              </button>

              <button
                onClick={() => navigate(`/room/${roomCode}`)}
                className="mt-6 bg-green-500 text-white w-full py-3 rounded-xl"
              >
                Enter Room →
              </button>
            </>
          ) : tab === "create" ? (
                <>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    ✨ Create New Room
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Set up a secure room and invite your team
                  </p>

                  <div className="mt-6">
                    <label className="text-sm text-gray-600">Room Name</label>
                     <input
                     type="text"
                     value={roomNameInput}
                     onChange={(e) => setRoomNameInput(e.target.value)}
                      placeholder="Project Discussion"
                      className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm text-gray-600">Room Password</label>
                    <input
                  type="password"
                  value={roomPasswordInput}
                  onChange={(e) => setRoomPasswordInput(e.target.value)}
                      className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400"
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
                  {/* JOIN ROOM */}
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    👥 Join Existing Room
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter the room code and password to join
                  </p>

                  <div className="mt-6">
                    <label className="text-sm text-gray-600">Room Code</label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="ABC123"
                      className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm text-gray-600">Room Password</label>
                    <input
                      type="password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      className="mt-1 w-full border rounded-xl px-4 py-2 outline-green-400"
                    />
                  </div>

                  <button
                  onClick={handleJoinRoom}
                   className="mt-6 bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-xl">
                    Join Room
                  </button>
              </>
          )}

        </div>
      </div>
    </div>
  );
}
