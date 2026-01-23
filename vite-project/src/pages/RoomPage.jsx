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
  const user = JSON.parse(
    localStorage.getItem("user") || '{"id":"anon","name":"Anonymous"}',
  );

  const [rightTab, setRightTab] = useState("video");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [role, setRole] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const speakingRef = useRef(false);

  // Helper to find the "Other Person" in the room dynamically
  const remoteUser = members.find(m => m.id !== user.id);

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

    socketRef.current.on("incoming-call", ({ from }) => {
      setIncomingCall(from);
    });

    socketRef.current.on("call-ended", () => {
      setIncomingCall(null);
      setCallActive(false);
    });

    socketRef.current.on("webrtc-offer", async ({ offer }) => {
      if (!peerRef.current) {
        await initializePeerConnection(false);
      }

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socketRef.current.emit("webrtc-answer", {
        roomId,
        answer,
      });
    });

    socketRef.current.on("user-typing", (name) => {
      setTypingUser(name);
    });

    socketRef.current.on("hide-typing", () => {
      setTypingUser("");
    });

    socketRef.current.on("remote-speaking", ({ speaking }) => {
      setRemoteSpeaking(speaking);
    });

    socketRef.current.on("webrtc-answer", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    });

    socketRef.current.on("webrtc-ice-candidate", async ({ candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Dynamic UI Listeners
    socketRef.current.on("remote-video-change", ({ enabled }) => setRemoteVideoOn(enabled));
    socketRef.current.on("remote-mic-change", ({ enabled }) => setRemoteMicOn(enabled));
    socketRef.current.on("remote-speaking", ({ speaking }) => setRemoteSpeaking(speaking));

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, user.id, user.name]);

  /* ---------------- FETCH OLD MESSAGES ---------------- */
  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Fetch error:", err));
  }, [roomId]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setRoomName(data.roomName);
        setRole(data.role);
      } catch (err) {
        console.error("Failed to load room details", err);
      }
    };

    fetchRoomDetails();
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
  /* ---------------- VIDEO CALL LOGIC ---------------- */
// const initializePeerConnection = async (isCaller = false) => {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     localVideoRef.current.srcObject = stream;
//     startSpeakingDetection(stream);

//     peerRef.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     // Add local tracks to the connection
//     stream.getTracks().forEach((track) => {
//       peerRef.current.addTrack(track, stream);
//     });

//     // Handle incoming remote tracks
//     peerRef.current.ontrack = (event) => {
//       console.log("Received remote track");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//         setRemoteStreamActive(true);
//       }
//     };

//     peerRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit("webrtc-ice-candidate", {
//           roomId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     if (isCaller) {
//       const offer = await peerRef.current.createOffer();
//       await peerRef.current.setLocalDescription(offer);
//       socketRef.current.emit("webrtc-offer", { roomId, offer });
//     }
    
//     setCallActive(true);
//   } catch (err) {
//     console.error("Media Access Error:", err);
//     alert("Could not access camera/mic");
//   }
// };

const initializePeerConnection = async (isCaller = false) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;
    startSpeakingDetection(stream);

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // 1. IMPORTANT: Add tracks BEFORE creating the offer
    stream.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, stream);
    });

    // 2. LISTEN for the remote stream
    peerRef.current.ontrack = (event) => {
      console.log("Remote stream received!");
      if (remoteVideoRef.current) {
        // Attach the first stream from the event to the remote video element
        remoteVideoRef.current.srcObject = event.streams[0];
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

    if (isCaller) {
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socketRef.current.emit("webrtc-offer", { roomId, offer });
    }
    
    setCallActive(true);
  } catch (err) {
    console.error("Media Access Error:", err);
  }
};

// const toggleCamera = () => {
//   const stream = localVideoRef.current.srcObject;
//   const videoTrack = stream.getVideoTracks()[0];
//   if (videoTrack) {
//     videoTrack.enabled = !videoTrack.enabled;
//     setVideoOn(videoTrack.enabled);
//     // Notify the other person so their UI hides your video tile
//     socketRef.current.emit("video-toggle", { roomId, enabled: videoTrack.enabled });
//   }
// };

  const startSpeakingDetection = (stream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);

      const volume =
        dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

      const speakingNow = volume > 15;

      if (speakingNow !== speakingRef.current) {
        speakingRef.current = speakingNow;
        setIsSpeaking(speakingNow);

        socketRef.current.emit("speaking", {
          roomId,
          speaking: speakingNow,
        });
      }

      requestAnimationFrame(checkVolume);
    };

    checkVolume();
  };

  // const startCall = async () => {
  //   setCallStarted(true);
  //   await initializePeerConnection();
  //   const offer = await peerRef.current.createOffer();
  //   await peerRef.current.setLocalDescription(offer);
  //   socketRef.current.emit("webrtc-offer", { roomId, offer });
  // };

  const startCall = async () => {
    setCallActive(true);

    // Notify others (Step 1)
    socketRef.current.emit("call-start", {
      roomId,
      user: { id: user.id, name: user.name },
    });

    // Caller initializes WebRTC
    await initializePeerConnection(true);
  };

  // const endCall = () => {
  //   socketRef.current.emit("call-end", { roomId });

  //   if (peerRef.current) {
  //     peerRef.current.close();
  //     peerRef.current = null;
  //   }

  //   if (localVideoRef.current?.srcObject) {
  //     localVideoRef.current.srcObject
  //       .getTracks()
  //       .forEach((track) => track.stop());
  //     localVideoRef.current.srcObject = null;
  //   }

  //   if (remoteVideoRef.current) {
  //     remoteVideoRef.current.srcObject = null;
  //   }

  //   setCallActive(false);
  //   setRemoteStreamActive(false);
  //   setRemoteVideoOn(true);
  //   setRemoteMicOn(true);
  // };

  // const endCall = () => {
  //   peerRef.current?.close();
  //   peerRef.current = null;
  //   localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
  //   if (localVideoRef.current) localVideoRef.current.srcObject = null;
  //   if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  //   setCallStarted(false);
  // };

  /*------------------------Toggle camera/mic---------------------*/

//   const toggleCamera = async () => {
//   const stream = localVideoRef.current?.srcObject;
//   if (!stream) return;

//   let videoTrack = stream.getVideoTracks()[0];

//   // 🔴 CASE 1: Video track exists → toggle
//   if (videoTrack) {
//     videoTrack.enabled = !videoTrack.enabled;
//     setVideoOn(videoTrack.enabled);
//     return;
//   }

//   // 🔴 CASE 2: Video track DOES NOT exist → ADD IT
//   try {
//     const videoStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//     });

//     const newVideoTrack = videoStream.getVideoTracks()[0];

//     // Add to local stream
//     stream.addTrack(newVideoTrack);

//     // Add to PeerConnection
//     peerRef.current.addTrack(newVideoTrack, stream);

//     // 🔥 IMPORTANT: replace track for remote peer
//     const sender = peerRef.current
//       .getSenders()
//       .find((s) => s.track?.kind === "video");

//     if (sender) {
//       sender.replaceTrack(newVideoTrack);
//     }

//     setVideoOn(true);
//   } catch (err) {
//     alert("Camera access failed");
//     console.error(err);
//   }
// };


// const toggleCamera = () => {
//   const stream = localVideoRef.current.srcObject;
//   const videoTrack = stream.getVideoTracks()[0];

//   videoTrack.enabled = !videoTrack.enabled;
//   setVideoOn(videoTrack.enabled);
// };


  // const toggleMic = () => {
  //   const stream = localVideoRef.current?.srcObject;
  //   if (!stream) return;

  //   const audioTrack = stream.getAudioTracks()[0];
  //   if (!audioTrack) return;

  //   audioTrack.enabled = !audioTrack.enabled;
  //   setMicOn(audioTrack.enabled);

  //   // 🔥 Notify others
  //   socketRef.current.emit("mic-status", {
  //     roomId,
  //     enabled: audioTrack.enabled,
  //   });
  // };

//   const toggleMic = () => {
//   const stream = localVideoRef.current.srcObject;
//   const audioTrack = stream.getAudioTracks()[0];

//   audioTrack.enabled = !audioTrack.enabled;
//   setMicOn(audioTrack.enabled);
// };

const endCall = () => {
    setCallActive(false);
    setRemoteStreamActive(false);
    if (peerRef.current) peerRef.current.close();
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const toggleCamera = () => {
    const track = localVideoRef.current.srcObject.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setVideoOn(track.enabled);
    socketRef.current.emit("video-toggle", { roomId, enabled: track.enabled });
  };

const toggleMic = () => {
  const stream = localVideoRef.current.srcObject;
  const audioTrack = stream?.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
    // Add this so the server can tell the other user
    socketRef.current.emit("mic-toggle", { roomId, enabled: audioTrack.enabled });
  }
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

  const Avatar = ({ name, speaking }) => (
    <div
      className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold bg-green-100 text-green-700 transition-all ${
        speaking ? "ring-4 ring-green-500 scale-105" : ""
      }`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );

  return (
    <div className="h-screen flex flex-col font-sans bg-white">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xl">
            ⬅
          </button>
          <div className="w-9 h-9 bg-gradient-to-tr from-purple-500 to-green-400 rounded-xl" />
          <div>
            <h2 className="font-semibold text-lg">
              {roomName || "Loading..."}
            </h2>
            <p className="text-sm text-gray-500">
              {roomId} • {members.length} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-green-600 border rounded-full px-4 py-1 text-sm bg-green-50">
            🔐 E2E Encrypted
          </span>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
            onClick={() => navigate("/")}
          >
            Leave
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden ">
        {/* LEFT PANEL: MEMBERS */}
        <div className="w-64 border-r p-4 space-y-4 overflow-y-auto bg-gray-50">
          <h3 className="font-semibold text-gray-700">
            👥 Members ({members.length})
          </h3>
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm"
            >
              {/* Avatar + Online Dot */}
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                    m.id === user.id && isSpeaking
                      ? "ring-2 ring-green-500 scale-105"
                      : ""
                  } ${
                    m.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {m.name[0].toUpperCase()}
                </div>

                {/* Online dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    m.status === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <span className="text-sm font-medium">
                {m.name} {m.id === user.id ? "(You)" : ""}
                {m.role === "admin" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    ADMIN
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* CENTER PANEL: CHAT */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${msg.senderId === user.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"}`}
                >
                  <p className="text-[10px] opacity-75 font-bold uppercase">
                    {msg.senderName}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            {typingUser && (
              <p className="text-xs italic text-gray-400">
                {typingUser} is typing...
              </p>
            )}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Type message..."
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white p-2 w-12 h-12 rounded-full hover:bg-green-600 transition"
            >
              ➤
            </button>
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
                {!callActive ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                      📹
                    </div>

                    <h3 className="font-bold">Ready to talk?</h3>

                    {incomingCall && (
                      <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-center">
                        <p className="text-sm font-semibold">
                          📞 Incoming call from {incomingCall.name}
                        </p>
                        <button onClick={() => initializePeerConnection(false)} className="bg-green-500 text-white px-6 py-2 rounded-full">Accept</button>
                      </div>
                    )}

                    <button
                      onClick={startCall}
                      className="bg-green-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-green-600"
                    >
                      Start Call
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
            {/* LOCAL VIDEO (Yourself) */}
            <div className="relative bg-black rounded-xl overflow-hidden h-32 shadow-md">
              <video
                ref={localVideoRef}
                autoPlay
                muted // Always mute local video to avoid feedback loops
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded">
                You {isSpeaking && "🎤"}
              </span>
            </div>

            {/* REMOTE VIDEO */}
            <div className={`relative bg-black rounded-xl overflow-hidden h-48 shadow-inner flex items-center justify-center 
              ${remoteSpeaking ? "ring-4 ring-green-500" : "border"}`}>
              
              {remoteStreamActive && remoteVideoOn ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar name="Remote" speaking={remoteSpeaking} />
              )}
              
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <span className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded">
                  Remote {!remoteMicOn && " (Muted)"}
                </span>
              </div>
            </div>
                    {/* CONTROLS */}
                    <div className="flex gap-3">
                      <button
                        onClick={toggleCamera}
                        className={`flex-1 py-2 rounded-xl font-semibold ${
                          videoOn ? "bg-gray-200" : "bg-yellow-400"
                        }`}
                      >
                        {videoOn ? "🎥 Camera On" : "🚫 Camera Off"}
                      </button>

                      <button
                        onClick={toggleMic}
                        className={`flex-1 py-2 rounded-xl font-semibold ${
                          micOn ? "bg-gray-200" : "bg-yellow-400"
                        }`}
                      >
                        {micOn ? "🎤 Mic On" : "🔇 Mic Muted"}
                      </button>
                    </div>

                    <button
                      onClick={endCall}
                      className="w-full bg-red-500 text-white py-2 rounded-xl font-semibold"
                    >
                      End Call
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100">
                  <span className="text-sm text-gray-500">
                    Click to upload files
                  </span>
                  <input type="file" hidden onChange={handleFileUpload} />
                </label>

                {files.map((file, i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center border"
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">
                        {file.fileName || file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {file.fileSize || file.size}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFile(file._id, i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      🗑
                    </button>
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
