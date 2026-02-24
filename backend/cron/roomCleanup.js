import cron from "node-cron";
import Room from "../models/Room.js";
import RoomMember from "../models/RoomMember.js";
import Message from "../models/Message.js";
import File from "../models/File.js";

const ROOM_EXPIRY_DAYS = 7; // change anytime

cron.schedule("0 3 * * *", async () => {
  console.log("🧹 Room cleanup started");

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - ROOM_EXPIRY_DAYS);

  try {
    const expiredRooms = await Room.find({
      lastActiveAt: { $lt: expiryDate },
      isExpired: false,
    });

    for (const room of expiredRooms) {
      console.log(`⏳ Expiring room: ${room.roomCode}`);

      // Soft delete room
      room.isExpired = true;
      await room.save();

      // Optional: hard cleanup related data
      await RoomMember.deleteMany({ roomId: room._id });
      await Message.deleteMany({ roomId: room.roomCode });
      await File.deleteMany({ roomId: room.roomCode });
    }

    console.log(`✅ Expired ${expiredRooms.length} rooms`);
  } catch (err) {
    console.error("❌ Room cleanup error:", err);
  }
});
