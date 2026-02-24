import File from "../models/File.js";

/* Upload file metadata */
export const uploadFile = async (req, res) => {
  try {
    const file = await File.create({
      roomId: req.body.roomId,
      fileName: req.body.fileName,
      fileSize: req.body.fileSize,
      uploadedBy: req.body.uploadedBy,
    });

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: "File upload failed" });
  }
};

/* Get files by room */
export const getFiles = async (req, res) => {
  const files = await File.find({ roomId: req.params.roomId });
  res.json(files);
};

/* Delete file */
export const deleteFile = async (req, res) => {
  await File.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
