import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: String,
    senderId: String,
    senderName: String,
    message: String,
    readBy: [String],
    replyTo: {
      messageId: String,
      senderName: String,
      message: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
