import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Safely parse user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || '{"id":"anon","name":"Anonymous"}');

  const [rightTab, setRightTab] = useState("video");
  const [callStarted, setCallStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  /* ---------------- SOCKET SETUP & WebRTC SIGNALING ---------------- */
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("join-room", {
      roomId,
      user: { id: user.id, name: user.name },
    });

    socketRef.current.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("members-update", (list) => {
      setMembers(list);
    });

    // --- Typing Signaling ---
    socketRef.current.on("display-typing", (name) => {
      setTypingUser(name);
    });
    socketRef.current.on("hide-typing", () => {
      setTypingUser("");
    });

    // --- WebRTC Signaling Listeners ---
    socketRef.current.on("webrtc-offer", async ({ offer }) => {
      if (!peerRef.current) await initializePeerConnection();
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socketRef.current.emit("webrtc-answer", { roomId, answer });
    });

    socketRef.current.on("webrtc-answer", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on("webrtc-ice-candidate", async ({ candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, user.id, user.name]);

  /* ---------------- FETCH OLD MESSAGES ---------------- */
  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(err => console.error("Fetch error:", err));
  }, [roomId]);

  /* ---------------- CHAT & TYPING ---------------- */
  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    socketRef.current.emit("send-message", {
      roomId,
      senderId: user.id,
      senderName: user.name,
      message: inputMessage,
    });
    setInputMessage("");
    stopTyping();
  };

  const handleTyping = () => {
    socketRef.current.emit("typing", { roomId, user: user.name });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    socketRef.current.emit("stop-typing", { roomId });
  };

  /* ---------------- VIDEO CALL LOGIC ---------------- */
  const initializePeerConnection = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));

    peerRef.current.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("webrtc-ice-candidate", { roomId, candidate: e.candidate });
      }
    };
  };

  const startCall = async () => {
    setCallStarted(true);
    await initializePeerConnection();
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socketRef.current.emit("webrtc-offer", { roomId, offer });
  };

  const endCall = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallStarted(false);
  };

  /* ---------------- FILE HANDLING ---------------- */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const res = await fetch("http://localhost:5000/api/files/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        uploadedBy: user.name,
      }),
    });

    const data = await res.json();
    setFiles((prev) => [...prev, data]);
  };

  const deleteFile = async (id, index) => {
    await fetch(`http://localhost:5000/api/files/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-white">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xl">⬅</button>
          <div className="w-9 h-9 bg-gradient-to-tr from-purple-500 to-green-400 rounded-xl" />
          <div>
            <h2 className="font-semibold text-lg">chit-chat</h2>
            <p className="text-sm text-gray-500">{roomId} • {members.length} online</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-green-600 border rounded-full px-4 py-1 text-sm bg-green-50">🔐 E2E Encrypted</span>
          <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg" onClick={() => navigate("/")}>Leave</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: MEMBERS */}
        <div className="w-64 border-r p-4 space-y-4 overflow-y-auto bg-gray-50">
          <h3 className="font-semibold text-gray-700">👥 Members ({members.length})</h3>
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                {m.name[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium">{m.name} {m.id === user.id ? "(You)" : ""}</span>
            </div>
          ))}
        </div>

        {/* CENTER PANEL: CHAT */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.senderId === user.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                  <p className="text-[10px] opacity-75 font-bold uppercase">{msg.senderName}</p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            {typingUser && <p className="text-xs italic text-gray-400">{typingUser} is typing...</p>}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => { setInputMessage(e.target.value); handleTyping(); }}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Type message..."
            />
            <button onClick={sendMessage} className="bg-green-500 text-white p-2 w-12 h-12 rounded-full hover:bg-green-600 transition">➤</button>
          </div>
        </div>

        {/* RIGHT PANEL: VIDEO & FILES */}
        <div className="w-80 border-l flex flex-col bg-gray-50">
          <div className="flex border-b bg-white">
            {["video", "files"].map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 py-3 text-sm capitalize ${rightTab === tab ? "border-b-2 border-green-500 font-bold text-green-600" : "text-gray-400"}`}
              >
                {tab === "video" ? "🎥 Video" : "📁 Files"}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {rightTab === "video" ? (
              <div className="h-full flex flex-col">
                {!callStarted ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl">📹</div>
                    <h3 className="font-bold">Ready to talk?</h3>
                    <button onClick={startCall} className="bg-green-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-green-600">Start Call</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-xl overflow-hidden h-40 shadow-inner">
                       <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                       <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded">You</span>
                    </div>
                    <div className="relative bg-black rounded-xl overflow-hidden h-40 shadow-inner">
                       <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                       <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded">Remote</span>
                    </div>
                    <button onClick={endCall} className="w-full bg-red-500 text-white py-2 rounded-xl font-semibold">End Call</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100">
                  <span className="text-sm text-gray-500">Click to upload files</span>
                  <input type="file" hidden onChange={handleFileUpload} />
                </label>
                {files.map((file, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center border">
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">{file.fileName || file.name}</p>
                      <p className="text-xs text-gray-400">{file.fileSize || file.size}</p>
                    </div>
                    <button onClick={() => deleteFile(file._id, i)} className="text-red-400 hover:text-red-600">🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}