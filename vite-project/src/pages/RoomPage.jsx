import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdRefresh, MdSend, MdCall, MdPeople, MdChatBubbleOutline, MdShield } from "react-icons/md";
import io from "socket.io-client";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]);
  const ringtoneRef = useRef(new Audio("/sounds/ringtone.mp3"));
  const incomingOfferRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("user") || '{"id":"anon","name":"Anonymous"}',
  );

  /* ================= STATES ================= */
  const [remoteVideoReady, setRemoteVideoReady] = useState(false);
  const [roomName, setRoomName] = useState("Secure Session");
  const [remoteVolume, setRemoteVolume] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const remoteUser = members.find((m) => m.id !== user.id);

  

  /* ---------------- SIGNALING & WebRTC (Logic preserved) ---------------- */
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-room", {
        roomId,
        user: { id: user.id, name: user.name },
      });
    });

    socketRef.current.on("members-update", (list) => setMembers(list));
    socketRef.current.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));
    socketRef.current.on("incoming-call", ({ from }) => {
      if (from.id !== user.id) setIncomingCall(from);
    });

    socketRef.current.on("webrtc-offer", ({ offer }) => {
      incomingOfferRef.current = offer;
    });

    socketRef.current.on("webrtc-answer", async ({ answer }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          if (pendingCandidates.current.length > 0) {
            pendingCandidates.current.forEach(async (candidate) => {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            });
            pendingCandidates.current = [];
          }
        }
      } catch (err) { console.error(err); }
    });

    socketRef.current.on("webrtc-ice-candidate", async ({ candidate }) => {
      if (peerRef.current?.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socketRef.current.on("remote-video-change", ({ enabled }) => setRemoteVideoOn(enabled));
    socketRef.current.on("remote-mic-change", ({ enabled }) => setRemoteMicOn(enabled));
    socketRef.current.on("remote-speaking", ({ speaking, volume }) => {
      setRemoteSpeaking(speaking);
      setRemoteVolume(volume || 0);
    });

    socketRef.current.on("call-ended", () => endCall());

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, user.id]);

  /* ---------------- WebRTC Actions ---------------- */
  const initializePeerConnection = async (isCaller = false) => {

   if (localVideoRef.current?.srcObject) {
  localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
  localVideoRef.current.srcObject = null;
}
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((e) => console.error(e));
        }
      }, 100);

      startSpeakingDetection(stream);

      if (!peerRef.current) {
        peerRef.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        peerRef.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (!remoteStream || !remoteVideoRef.current) return;
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadeddata = () => {
            remoteVideoRef.current.play().catch(() => {});
            setRemoteStreamActive(true);
            requestAnimationFrame(() => setRemoteVideoReady(true));
          };
        };
        peerRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("webrtc-ice-candidate", { roomId, candidate: event.candidate });
          }
        };
      }

      if (peerRef.current.getSenders().length === 0) {
        stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));
      }

      if (isCaller) {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socketRef.current.emit("webrtc-offer", { roomId, offer });
      }

      setCallActive(true);
      setIsConnecting(false);
    } catch (err) { 
      console.error(err)
    }
  };

  const endCall = () => {
    setCallActive(false);
    setRemoteStreamActive(false);
    setIncomingCall(null);
    setIsConnecting(false);
    setRemoteVideoReady(false);
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    socketRef.current.emit("end-call", { roomId });
  };

  const toggleCamera = () => {
    const track = localVideoRef.current?.srcObject?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoOn(track.enabled);
      socketRef.current.emit("video-toggle", { roomId, enabled: track.enabled });
    }
  };

 const toggleMic = () => {
  const track = localVideoRef.current?.srcObject?.getAudioTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    setMicOn(track.enabled);

    socketRef.current.emit("mic-toggle", {
      roomId,
      enabled: track.enabled,
    });
  }
};

  const startSpeakingDetection = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const check = () => {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((sum, v) => sum + v, 0) / data.length;
      socketRef.current.emit("speaking", { roomId, speaking: volume > 15, volume: Math.min(volume / 100, 1) });
      if (callActive) requestAnimationFrame(check);
    };
    check();
  };

  const refreshCamera = async () => {
  try {
    // Stop old tracks first
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;

    const videoTrack = stream.getVideoTracks()[0];
    const sender = peerRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");

    if (sender) sender.replaceTrack(videoTrack);

    setVideoOn(true);
  } catch (err) {
    console.error(err);
  }
};

  /* ================= UI HELPERS ================= */
  const getAvatarColor = (id = "") => {
    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500"];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B0F14] text-white font-['Outfit'] overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 bg-[#111827]/80 border-b border-slate-800 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MdShield size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">{roomName}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              {roomId} • {members.length} Secure Nodes
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-red-500 hover:text-white hover:border-red-400 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Leave Session
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MEMBERS SIDEBAR */}
        <aside className="w-72 bg-[#0D1117] border-r border-slate-800/50 p-6 hidden lg:flex flex-col">
          <div className="flex items-center gap-2 mb-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
            <MdPeople size={16} /> Nodes in Room
          </div>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-900/50 transition-colors group">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-2xl ${getAvatarColor(m.id)} flex items-center justify-center font-bold text-white shadow-lg`}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#0B0F14] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                    {m.name.split(' ')[0]} {m.id === user.id && <span className="text-slate-500 text-[10px] font-medium">(You)</span>}
                  </span>
                  <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
                    {m.role || 'Member'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN VIDEO STAGE */}
        <main className="flex-[3] relative bg-black flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none"></div>

          {/* CALLING / CONNECTING STATES */}
          {(callActive || isConnecting) && (
            <div className="w-full h-full relative flex items-center justify-center">
              {isConnecting && !remoteStreamActive && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-[2.5rem]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Establishing E2E Link</p>
                  </div>
                </div>
              )}

              {/* REMOTE TILE */}
              <div className={`w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl relative transition-all duration-500 ${remoteSpeaking ? "ring-4 ring-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]" : ""}`}>
                <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-1000 ${remoteVideoReady && remoteVideoOn ? "opacity-100" : "opacity-0"}`} />
                
                {(!remoteVideoOn || !remoteStreamActive) && remoteUser && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div 
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-2xl transition-transform duration-100 ${getAvatarColor(remoteUser.id)}`}
                      style={{ transform: `scale(${1 + remoteVolume * 0.4})` }}
                    >
                      {remoteUser.name[0].toUpperCase()}
                    </div>
                    <p className="mt-6 text-slate-400 font-bold tracking-widest uppercase text-xs">{remoteUser.name}</p>
                  </div>
                )}

                <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${remoteMicOn ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{remoteUser?.name || 'Peer'}</span>
                </div>
              </div>

              {/* LOCAL TILE (PIP) */}
              <div className="absolute top-8 right-8 w-48 h-64 bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl z-30 group">
                <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover transition-opacity duration-300 ${videoOn ? "opacity-100" : "opacity-0"}`} />
                {!videoOn && (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${getAvatarColor(user.id)}`}>
                        {user.name[0].toUpperCase()}
                      </div>
                   </div>
                )}
                <div className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-tighter bg-emerald-600 px-2 py-1 rounded-md">You (Node 01)</div>
              </div>

              {/* TOOLBAR */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-[#111827]/80 backdrop-blur-2xl px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl">
                <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all ${micOn ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"}`}>
                  {micOn ? <MdMic size={24} /> : <MdMicOff size={24} />}
                </button>
                <button onClick={toggleCamera} className={`p-4 rounded-2xl transition-all ${videoOn ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"}`}>
                  {videoOn ? <MdVideocam size={24} /> : <MdVideocamOff size={24} />}
                </button>
                <button onClick={refreshCamera} className="p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-white transition-all">
                  <MdRefresh size={24} />
                </button>
                <div className="w-px h-8 bg-slate-700 mx-2"></div>
                <button onClick={endCall} className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/20 flex items-center gap-2">
                  <MdCallEnd size={20} /> Terminate
                </button>
              </div>
            </div>
          )}

          {/* INCOMING CALL MODAL */}
          {!callActive && !isConnecting && incomingCall && (
            <div className="bg-[#111827] p-12 rounded-[3rem] border border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.1)] flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-8 animate-bounce">
                <MdCall size={48} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-2">{incomingCall.name}</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-10">Requesting Secure Link...</p>
              <button 
                onClick={async () => {
  setIsConnecting(true);
  await initializePeerConnection(false);

  if (incomingOfferRef.current && peerRef.current) {
    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(incomingOfferRef.current)
    );

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socketRef.current.emit("webrtc-answer", {
      roomId,
      answer,
    });

    incomingOfferRef.current = null;
  }

  setIncomingCall(null);
}}// Logic simplified for brevity, use your existing Accept handler
                className="bg-emerald-600 hover:bg-emerald-500 px-16 py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all shadow-xl shadow-emerald-900/40"
              >
                Accept Connection
              </button>
            </div>
          )}

          {/* STANDBY STATE */}
          {!callActive && !isConnecting && !incomingCall && (
            <div className="text-center">
               <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <MdVideocam size={40} className="text-slate-700" />
               </div>
               <button
                onClick={() => { setIsConnecting(true); socketRef.current.emit("call-start", { roomId, user }); initializePeerConnection(true); }}
                className="bg-emerald-600 hover:bg-emerald-500 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white shadow-2xl shadow-emerald-900/20 transition-all hover:-translate-y-1"
              >
                Initialize Video Node
              </button>
            </div>
          )}
        </main>

        {/* CHAT SIDEBAR */}
        <section className="w-80 bg-[#0D1117] border-l border-slate-800/50 flex flex-col">
          <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
            <span className="font-black text-[10px] text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <MdChatBubbleOutline size={16} className="text-emerald-500" /> Encrypted Logs
            </span>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.senderId === user.id ? "items-end" : "items-start"}`}>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">
                  {m.senderName.split(' ')[0]}
                </span>
                <div className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] leading-relaxed shadow-sm ${
                  m.senderId === user.id ? "bg-emerald-600 text-white font-medium rounded-tr-none" : "bg-slate-800/50 text-slate-300 border border-slate-700/50 rounded-tl-none"
                }`}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#0D1117]">
            <div className="relative flex items-center">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputMessage && (socketRef.current.emit("send-message", { roomId, ...user, message: inputMessage }), setInputMessage(""))}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:border-emerald-500/50 outline-none transition-all pr-14 font-medium"
                placeholder="Secure message..."
              />
              <button 
                onClick={() => inputMessage && (socketRef.current.emit("send-message", { roomId, ...user, message: inputMessage }), setInputMessage(""))}
                className="absolute right-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all"
              >
                <MdSend size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}