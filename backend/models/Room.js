import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: String,
    roomName: String,
    password: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 🔥 ADD THESE
    isExpired: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
