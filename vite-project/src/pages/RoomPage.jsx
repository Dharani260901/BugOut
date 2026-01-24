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
  const pendingCandidates = useRef([]);
  const ringtoneRef = useRef(new Audio("/sounds/ringtone.mp3"));

  const user = JSON.parse(
    localStorage.getItem("user") || '{"id":"anon","name":"Anonymous"}',
  );

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);

  const remoteUser = members.find((m) => m.id !== user.id);

  /* ---------------- SIGNALING & WebRTC ---------------- */
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
   // Use .on('connect') to ensure we only join once the socket is ready
  socketRef.current.on("connect", () => {
    socketRef.current.emit("join-room", {
      roomId,
      user: { id: user.id, name: user.name },
    });
  });

    socketRef.current.on("members-update", (list) => setMembers(list));
    socketRef.current.on("receive-message", (msg) =>
      setMessages((prev) => [...prev, msg]),
    );
    // 1. ADD THIS: Specific listener for the start event
  socketRef.current.on("incoming-call", ({ from }) => {
    // Crucial: check ID to ensure the caller doesn't see their own pop-up
    if (from.id !== user.id) {
      setIncomingCall(from);
    }
  });

   socketRef.current.on("webrtc-offer", async ({ offer }) => {
    // If connection isn't ready, initialize it first
    if (!peerRef.current) {
      await initializePeerConnection(false);
    }
    
    try {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socketRef.current.emit("webrtc-answer", { roomId, answer });
    } catch (err) {
      console.error("Error during offer handling:", err);
    }
  });

    socketRef.current.on("webrtc-answer", async ({ answer }) => {
      console.log("Mahesh received Vikash's answer");
      try {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );

          // After setting the description, process any candidates that arrived early
          if (pendingCandidates.current.length > 0) {
            pendingCandidates.current.forEach(async (candidate) => {
              await peerRef.current.addIceCandidate(
                new RTCIceCandidate(candidate),
              );
            });
            pendingCandidates.current = [];
          }
        }
      } catch (err) {
        console.error("Error setting remote description on Mahesh side:", err);
      }
    });

    socketRef.current.on("webrtc-ice-candidate", async ({ candidate }) => {
      if (peerRef.current?.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socketRef.current.on("remote-video-change", ({ enabled }) =>
      setRemoteVideoOn(enabled),
    );
    socketRef.current.on("remote-mic-change", ({ enabled }) =>
      setRemoteMicOn(enabled),
    );
    socketRef.current.on("remote-speaking", ({ speaking }) =>
      setRemoteSpeaking(speaking),
    );
    socketRef.current.on("call-ended", () => endCall());

   return () => {
    if (socketRef.current) {
      socketRef.current.off("incoming-call");
      socketRef.current.disconnect();
    }
  };
}, [roomId, user.id]);

  const initializePeerConnection = async (isCaller = false) => {
    try {
      // 1. Get the camera/mic from the hardware
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // 2. 🔥 THE ULTIMATE FIX FOR THE BLACK "YOU" TILE:
      // We wait 100ms to ensure React has actually rendered the <video> tag
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Force the video to start playing
          localVideoRef.current
            .play()
            .catch((e) => console.error("Local play failed:", e));
          console.log("Local stream successfully attached to YOU tile");
        } else {
          console.error("YOU tile video element (localVideoRef) not found!");
        }
      }, 100);

      startSpeakingDetection(stream);

      // 3. Setup the Peer-to-Peer connection
      if (!peerRef.current) {
        peerRef.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // When the OTHER person's video arrives
        peerRef.current.ontrack = (event) => {
  const [remoteStream] = event.streams;
  if (remoteVideoRef.current && remoteStream) {
    remoteVideoRef.current.srcObject = remoteStream;

    // 🔥 FIX: Monitor the track for "stuck" frames
    const videoTrack = remoteStream.getVideoTracks()[0];
    
    videoTrack.onmute = () => {
      console.log("Vikash's stream is muted/stuck. Attempting to re-sync...");
      // This happens if DroidCam loses connection
    };

    videoTrack.onunmute = () => {
      console.log("Vikash's stream recovered.");
    };

    remoteVideoRef.current.play().catch(e => console.error("Auto-play failed:", e));
    setRemoteStreamActive(true);
  }
};

        peerRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("webrtc-ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };
      }

      // 4. Send our tracks to the other person
      stream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, stream);
      });

      if (isCaller) {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socketRef.current.emit("webrtc-offer", { roomId, offer });
      }

      setCallActive(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  useEffect(() => {
  if (incomingCall) {
    ringtoneRef.current.loop = true;
    ringtoneRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
  } else {
    ringtoneRef.current.pause();
    ringtoneRef.current.currentTime = 0;
  }
}, [incomingCall]);

  const toggleCamera = () => {
    const track = localVideoRef.current?.srcObject?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoOn(track.enabled);
      socketRef.current.emit("video-toggle", {
        roomId,
        enabled: track.enabled,
      });
    }
  };

  const toggleMic = () => {
    const track = localVideoRef.current?.srcObject?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
      socketRef.current.emit("mic-toggle", { roomId, enabled: track.enabled });
    }
  };

  const endCall = () => {
    setCallActive(false);
    setRemoteStreamActive(false);
    peerRef.current?.close();
    peerRef.current = null;
    localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    socketRef.current.emit("end-call", { roomId });
  };

  const startSpeakingDetection = (stream) => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const check = () => {
      analyser.getByteFrequencyData(data);
      const vol = data.reduce((a, b) => a + b) / data.length;
      const speaking = vol > 15;
      if (speaking !== speakingRef.current) {
        speakingRef.current = speaking;
        setIsSpeaking(speaking);
        socketRef.current.emit("speaking", { roomId, speaking });
      }
      if (callActive) requestAnimationFrame(check);
    };
    check();
  };

  const refreshCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    
    // Replace the track in the existing Peer Connection so Mahesh sees the update
    const videoTrack = stream.getVideoTracks()[0];
    const sender = peerRef.current.getSenders().find(s => s.track.kind === 'video');
    if (sender) sender.replaceTrack(videoTrack);
    
    setVideoOn(true);
  } catch (err) {
    console.error("Failed to refresh DroidCam:", err);
  }
};

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-bold text-green-400">
          ⚡ WebRTC Room: {roomId}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-sm font-bold transition"
        >
          Leave Room
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN VIDEO AREA */}
        <div className="flex-[3] relative bg-black flex items-center justify-center p-4">
  {!callActive ? (
    <div className="z-10">
      {incomingCall ? (
        /* THE MODAL FROM YOUR SCREENSHOT */
        <div className="bg-slate-800 p-10 rounded-[2rem] border-2 border-green-500 shadow-2xl flex flex-col items-center min-w-[300px]">
          <div className="w-24 h-24 bg-green-500 rounded-full mb-6 flex items-center justify-center text-4xl animate-pulse">
            📞
          </div>
          <h3 className="text-2xl font-bold mb-6 text-white">
            {incomingCall.name} is calling...
          </h3>
          <button
            onClick={() => {
              setIncomingCall(null);
              initializePeerConnection(false); // Acceptor role
            }}
            className="bg-green-500 hover:bg-green-600 px-12 py-3 rounded-full font-bold text-lg text-white transition-all transform hover:scale-105"
          >
            Accept Call
          </button>
        </div>
      ) : (
        /* START CALL BUTTON (Initial State) */
        <button
          onClick={() => {
            socketRef.current.emit("call-start", { roomId, user });
            initializePeerConnection(true); // Caller role
          }}
          className="bg-blue-600 hover:bg-blue-700 px-12 py-4 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105"
        >
          Start Video Call
        </button>
      )}
    </div>
  ) : (
            <div className="w-full h-full relative flex items-center justify-center">
              {/* REMOTE VIDEO (THE OTHER PERSON - FULLSCREEN) */}
              <div
                className={`w-full h-full rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center relative ${remoteSpeaking ? "ring-4 ring-green-500" : ""}`}
              >
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${!remoteVideoOn || !remoteStreamActive ? "hidden" : "block"}`}
                />
                {(!remoteVideoOn || !remoteStreamActive) && (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-5xl font-bold mx-auto mb-4">
                      {remoteUser?.name[0].toUpperCase()}
                    </div>
                    <p className="text-xl text-slate-400">
                      {remoteUser?.name} (Camera Off)
                    </p>
                  </div>
                )}
                <div className="absolute bottom-6 left-6 bg-black/50 px-4 py-2 rounded-full text-sm font-bold">
                  {remoteUser?.name} {remoteMicOn ? "🎤" : "🔇"}
                </div>
              </div>

              {/* LOCAL VIDEO (YOU - FLOATING TILE) */}
              {/* LOCAL VIDEO (YOU - FLOATING TILE) */}
              <div className="absolute top-6 right-6 w-48 h-64 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white shadow-2xl flex items-center justify-center z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!videoOn ? "hidden" : "block"}`}
                />

                {/* Show Initial/Avatar ONLY if camera is toggled off manually */}
                {!videoOn && (
                  <div className="flex items-center justify-center text-4xl font-bold bg-slate-700 w-full h-full">
                    {user.name[0].toUpperCase()}
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white">
                  You
                </div>
              </div>

              {/* FLOATING CONTROLS */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition ${micOn ? "bg-slate-700" : "bg-red-500"}`}
                >
                  {micOn ? "🎤" : "🔇"}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition ${videoOn ? "bg-slate-700" : "bg-red-500"}`}
                >
                  {videoOn ? "📷" : "🚫"}
                </button>

                {/* 🔥 NEW REFRESH BUTTON FOR VIKASH */}
  <button 
    onClick={refreshCamera} 
    className="bg-blue-500 p-4 rounded-full hover:bg-blue-600 transition"
    title="Fix Stuck Camera"
  >
    🔄
  </button>
                <button
                  onClick={endCall}
                  className="bg-red-600 p-4 rounded-full hover:bg-red-700 transition px-8 font-bold"
                >
                  End Call
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CHAT SIDEBAR (MINIMIZED FEEL) */}
        <div className="flex-1 bg-[#1e293b] border-l border-slate-800 flex flex-col shadow-xl">
  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
    <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Live Chat</span>
    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
    </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.senderId === user.id ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-slate-500 mb-1">
                  {m.senderName}
                </span>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[90%] ${m.senderId === user.id ? "bg-blue-600" : "bg-slate-700 text-white"}`}
                >
                  {m.message}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-900 flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (socketRef.current.emit("send-message", {
                  roomId,
                  ...user,
                  message: inputMessage,
                }),
                setInputMessage(""))
              }
              className="flex-1 bg-slate-800 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                socketRef.current.emit("send-message", {
                  roomId,
                  ...user,
                  message: inputMessage,
                });
                setInputMessage("");
              }}
              className="bg-blue-600 p-2 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

   
