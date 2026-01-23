import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: String,
    roomName: String,
    password: String, // hashed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
