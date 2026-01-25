import Room from "../models/Room.js";
import Message from "../models/Message.js";
import File from "../models/File.js";
import RoomMember from "../models/RoomMember.js";
import bcrypt from "bcryptjs";

const generateRoomCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const createRoom = async (req, res) => {
  const { roomName, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const roomCode = generateRoomCode();

  const room = await Room.create({
    roomName,
    roomCode,
    password: hashed,
    createdBy: req.userId,
  });

  await RoomMember.create({
    roomId: room._id,
    userId: req.userId,
    role: "admin",
    status: "online",
  });

  res.status(201).json({ roomId: room.roomCode, roomName: room.roomName });
};

export const joinRoom = async (req, res) => {
  const { roomCode, password } = req.body;

  const room = await Room.findOne({ roomCode });
  if (!room) return res.status(404).json({ message: "Room not found" });

  const match = await bcrypt.compare(password, room.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  await RoomMember.findOneAndUpdate(
    { roomId: room._id, userId: req.userId },
    { status: "online" },
    { upsert: true }
  );

 const member = await RoomMember.findOne({
  roomId: room._id,
  userId: req.userId,
});

res.json({
  roomId: room.roomCode,
  roomName: room.roomName,
  role: member.role,
});

};


export const getRoomDetails = async (req, res) => {
  const { roomCode } = req.params;

  const room = await Room.findOne({ roomCode });
  if (!room) return res.status(404).json({ message: "Room not found" });

  const member = await RoomMember.findOne({
    roomId: room._id,
    userId: req.userId,
  });

  res.json({
    roomName: room.roomName,
    role: member?.role || "member",
  });
};


/* -------- DELETE ROOM (ADMIN ONLY) -------- */
export const deleteRoom = async (req, res) => {
  const { roomCode } = req.params;

  const room = await Room.findOne({ roomCode });
  if (!room) return res.status(404).json({ message: "Room not found" });

  const member = await RoomMember.findOne({
    roomId: room._id,
    userId: req.userId,
  });

  if (!member || member.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  await RoomMember.deleteMany({ roomId: room._id });
  await Message.deleteMany({ roomId: roomCode });
  await File.deleteMany({ roomId: roomCode });
  await Room.findByIdAndDelete(room._id);

  res.json({ message: "Room deleted successfully" });
};

export const getMyRooms = async (req, res) => {
  try {
    const memberships = await RoomMember.find({
  userId: req.userId,
}).populate({
  path: "roomId",
  match: { isExpired: false },
});


    // 🔥 FULLY SAFE VERSION
    const rooms = memberships
      .filter((m) => m.roomId !== null) // ✅ THIS WAS MISSING / WRONG
      .map((m) => ({
  roomId: m.roomId._id,
  roomCode: m.roomId.roomCode,
  roomName: m.roomId.roomName,
  role: m.role, // ✅ ADD THIS
  createdAt: m.roomId.createdAt,
}));


    res.json(rooms);
  } catch (err) {
    console.error("getMyRooms error:", err);
    res.status(500).json({ message: "Failed to load rooms" });
  }
};

export const getRoom = async (req, res) => {
  const room = await Room.findOne({ roomCode: req.params.roomId })
    .populate("createdBy", "name");

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  const role =
    room.createdBy._id.toString() === req.userId
      ? "admin"
      : "member";

  res.json({
    roomName: room.roomName,
    role,
  });
};
