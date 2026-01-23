import { Server } from "socket.io";
import Message from "./models/Message.js";
import RoomMember from "./models/RoomMember.js";
import Room from "./models/Room.js"

const onlineUsers = {}; // socketId -> { roomId, user }

export default function socketServer(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    /* ================= JOIN ROOM ================= */
    socket.on("join-room", async ({ roomId, user }) => {
      socket.join(roomId);

      // 🔥 FIX: find room by roomCode
      const room = await Room.findOne({ roomCode: roomId });
      if (!room) return;

      const member = await RoomMember.findOne({
        roomId: room._id, // ✅ ObjectId
        userId: user.id,
      });

      onlineUsers[socket.id] = {
        roomId: room._id,
        user: {
          ...user,
          role: member?.role || "member",
        },
      };

      const members = Object.values(onlineUsers)
        .filter((u) => u.roomId.toString() === room._id.toString())
        .map((u) => ({
          id: u.user.id,
          name: u.user.name,
          role: u.user.role,
          status: "online",
        }));

      io.to(roomId).emit("members-update", members);
    });

    socket.on("admin-mute-user", ({ roomId, targetUserId }) => {
      const sender = onlineUsers[socket.id];

      if (!sender || sender.user.role !== "admin") return;

      io.to(roomId).emit("user-muted", targetUserId);
    });

    // ================= CALL STATE (STEP 1) =================

// User starts a call
socket.on("call-start", ({ roomId, user }) => {
  socket.to(roomId).emit("incoming-call", {
    from: user,
  });
});

// Inside io.on("connection", (socket) => { ...

socket.on("video-toggle", ({ roomId, enabled }) => {
  socket.to(roomId).emit("remote-video-change", { enabled });
});

// Ensure your webrtc-ice-candidate is broadcast correctly
// socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
//   socket.to(roomId).emit("webrtc-ice-candidate", { candidate });
// });

socket.on("speaking", ({ roomId, speaking }) => {
  socket.to(roomId).emit("remote-speaking", {
    speaking,
  });
});


// User ends a call
socket.on("call-end", ({ roomId }) => {
  socket.to(roomId).emit("call-ended");
});

    /* ================= CHAT ================= */
    socket.on("send-message", async (data) => {
      try {
        const msg = await Message.create({
          roomId: data.roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          replyTo: data.replyTo || null,
          readBy: [data.senderId],
        });

        io.to(data.roomId).emit("receive-message", msg);
      } catch (err) {
        console.error("❌ Message error:", err);
      }
    });

    /* ================= TYPING ================= */
    socket.on("typing", ({ roomId, user }) => {
      socket.to(roomId).emit("user-typing", user);
    });

    socket.on("stop-typing", ({ roomId }) => {
      socket.to(roomId).emit("hide-typing");
    });

    /* ================= READ RECEIPTS ================= */
    socket.on("message-read", async ({ roomId, messageId, userId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: userId },
        });

        io.to(roomId).emit("message-read-update", {
          messageId,
          userId,
        });
      } catch (err) {
        console.error("❌ Read receipt error:", err);
      }
    });

    /* ================= WEBRTC SIGNALING ================= */

    // OFFER
    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", { offer });
    });

    // ANSWER
    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", { answer });
    });

    // ICE CANDIDATE
    socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
  socket.broadcast.to(roomId).emit("webrtc-ice-candidate", { candidate });
});

    /* ================= ADMIN ACTIONS ================= */
    socket.on("mute-user", ({ roomId, targetUserId }) => {
      io.to(roomId).emit("user-muted", targetUserId);
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      const data = onlineUsers[socket.id];

      if (data) {
        delete onlineUsers[socket.id];

        const members = Object.values(onlineUsers)
          .filter((u) => u.roomId === data.roomId)
          .map((u) => ({
            ...u.user,
            status: "online",
          }));

        io.to(data.roomId).emit("members-update", members);
      }

      console.log("❌ Disconnected:", socket.id);
    });
  });
}
