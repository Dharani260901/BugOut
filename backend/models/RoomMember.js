import mongoose from "mongoose";

const roomMemberSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, default: "member" },
    status: { type: String, default: "offline" },
    muted: { type: Boolean, default: false },

  },
  { timestamps: true }
);

export default mongoose.model("RoomMember", roomMemberSchema);
