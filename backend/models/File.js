import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    roomId: String,
    fileName: String,
    fileSize: String,
    uploadedBy: String,
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
